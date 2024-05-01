import { NextResponse } from "next/server";
// import { Client } from "@upstash/qstash";
import { getRelatedKeywords, getSerpData } from "@/helpers/seo";
import { supabaseAdmin } from "@/helpers/supabase";
import { compact } from "lodash";
import { marked } from "marked";
import { AI } from "../AI";
import { getSummary } from 'readability-cyr';
import { getProjectContext } from "../helpers";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");

export async function POST(request: Request) {
  const body = await request.json();
  const seedKeyword = body.seed_keyword;

  const { data: project } = await supabase.from("projects").select("*").eq("id", body.project_id).limit(1).single().throwOnError()
  const { data: language } = await supabase.from("languages").select("*").eq("id", project.language_id).limit(1).single().throwOnError()

  if (!project) {
    return NextResponse.json({ message: "not project found" }, { status: 500 })
  }

  const [{ data: relatedKeywords }, { data: serpDataForSeedKeyword }] = await Promise.all([
    getRelatedKeywords({ keyword: seedKeyword, depth: 2, limit: 50, api: true, lang: language.code, location_code: language.location_code }),
    getSerpData({ keyword: seedKeyword, depth: 20, lang: language.code, location_code: language.location_code })
  ])

  if (relatedKeywords?.tasks_error > 0 || !relatedKeywords) {
    return NextResponse.json({ message: "error fetching related keywords" }, { status: 500 })
  }
  if (serpDataForSeedKeyword?.tasks_error > 0 || !serpDataForSeedKeyword) {
    return NextResponse.json({ message: "error fetching competitors ranking for main keyword" }, { status: 500 })
  }

  try {
    let keywords: any = {};

    relatedKeywords?.tasks[0].result
      .map((item: any) => {
        return item?.items?.map((subItem: any) => {
          return compact([
            subItem?.keyword_data?.keyword,
            subItem?.related_keywords,
          ])
        })
      })
      .flat(Infinity)
      .forEach((keyword: string) => {
        keywords[keyword] = true;
      });

    keywords = Object.keys(keywords).slice(0, 20);

    // const descriptions: string[] = [];
    const competitorsHeadlines = serpDataForSeedKeyword?.tasks[0].result
      .map((item: any) => {
        return item?.items
          .filter((subItem: any) => subItem.type === "organic")
          .map((subItem: any) => {
            // descriptions.push(subItem.description)
            return subItem.title
          })
      })
      .flat(Infinity)

    const context = getProjectContext({
      name: project.name,
      website: project.website,
      description: project.metatags?.description || project?.description,
      lang: language.label,
    })

    const start = performance.now();

    const ai = new AI({ context });

    let title = await ai.title({
      competitorsHeadlines,
      seedKeyword,
      purpose: body.purpose.replaceAll("_", " "),
      tone: body.tones.join(","),
      contentType: body.content_type.replaceAll("_", " "),
      clickbait: !!body.clickbait
    });

    title = title.trim().startsWith("#") ? title.trim() : `# ${title.trim()}`

    ai.addArticleContent(title)

    const outline = await ai.outline({
      title,
      word_count: body.words_count,
      keywords: keywords.join(','),
      introduction: body.with_introduction,
      conclusion: body.with_conclusion,
      key_takeways: body.with_key_takeways,
      faq: body.with_faq,
    });
    console.log(outline)
    let outlineStr = "";

    outline.sections.forEach((section: any) => {
      outlineStr += `${section.title}\n`;
      if (section.sub_sections) {
        section.sub_sections.forEach((subSection: any) => {
          outlineStr += ` ${subSection.title}\n`;
        })
      }
    });

    console.log(outlineStr)

    for (const section of outline.sections) {
      ai.resetPrompt()

      let sectionWithSubWordCount = section.word_count;

      if (section.sub_sections) {
        let subSectionsTotalWordCount = section.sub_sections.reduce((a: any, b: any) => a.word_count + b.word_count);
        sectionWithSubWordCount = subSectionsTotalWordCount >= sectionWithSubWordCount ? 150 : sectionWithSubWordCount
      }

      let content = await ai.write({
        heading_prefix: "##",
        title,
        heading: section.title,
        word_count: section.sub_sections ? sectionWithSubWordCount : section.word_count,
        outline: outlineStr,
        perspective: body.perspective
      });

      // content = content.startsWith("## ") ? content : content.replace("##", "## ")

      let stats = getSummary(content)

      if (stats.difficultWords >= 5 || stats.FleschKincaidGrade > 9) {
        content = await ai.rephrase(content);
      }

      ai.addArticleContent(content);

      if (section.sub_sections) {
        for (const subSection of section.sub_sections) {
          content = await ai.write({
            heading_prefix: "###",
            title,
            heading: subSection.title,
            word_count: subSection.word_count,
            outline: outlineStr,
            perspective: body.perspective
          });

          stats = getSummary(content)

          if (stats.difficultWords >= 5 || stats.FleschKincaidGrade > 9) {
            content = await ai.rephrase(content);
          }

          ai.addArticleContent(content);
        }
      }

      // if (section.type === "section" || section.type === "sub_section") {
      //   content = await ai.expand(content);
      // }
      // content = await ai.rephrase(content);
      // content = await ai.paraphrase(content, `Living your best (off-the-shelf) life
      // The secret to a great healthy eating plan is balance. It’s also the most difficult thing to get right consistently over a period of time. You might have limited options to get great fresh food near where you live. Or you might not have the time during one week to brainstorm bundles of innovative healthy meal plans. Life can get in the way when you’re trying to get healthy.`);
      // ai.addArticleContent(content);
    }

    const end = performance.now();

    const { data: article } = await supabase.from("blog_posts")
      .insert({
        ...body,
        seed_keyword: seedKeyword,
        keywords,
        // prompt
        markdown: ai.article,
        html: marked.parse(ai.article),
        writing_time_sec: (end - start) / 1000,
        title: title.replace("#", "").trim(),
        status: 'ready_to_view',
      })
      .select("*")
      .single()
      .throwOnError();


    if (!article) {
      return NextResponse.json({ message: "Article creation failed" }, { status: 500 });
    }

    // const response = await client.publishJSON({
    //   url: process.env.NEXT_PUBLIC_API_PING || "",
    //   body: {
    //     payload: body,
    //     prompt,
    //     article: {
    //       id: queuedArticle.id,
    //       keywords,
    //     },
    //     project: {
    //       id: project.id,
    //       name: project.name,
    //       description: project?.metatags?.description || project?.description || "N/A",
    //       language
    //     }
    //   }
    // });

    // await supabase.from("blog_posts")
    //   .update({ message_id: response.messageId })
    //   .eq("id", queuedArticle.id)
    //   .throwOnError()

    return NextResponse.json({
      article,
      stats: getSummary(ai.article),
    }, { status: 200 });
  } catch (e) {
    console.log(e)
    return NextResponse.json(e, { status: 500 })
  }
}