import { NextResponse } from "next/server";
import { Client } from "@upstash/qstash";
import { getRelatedKeywords, getSerpData } from "@/helpers/seo";
import { supabaseAdmin } from "@/helpers/supabase";
import { compact } from "lodash";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");

const client = new Client({
  token: process.env.NEXT_PUBLIC_QSTASH_TOKEN || "",
  retry: {
    retries: 0,
    backoff: () => 0
  }
});

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

    const descriptions: string[] = [];
    const competitorsHeadlines = serpDataForSeedKeyword?.tasks[0].result
      .map((item: any) => {
        return item?.items
          .filter((subItem: any) => subItem.type === "organic")
          .map((subItem: any) => {
            descriptions.push(subItem.description)
            return subItem.title
          })
      })
      .flat(Infinity)

    const prompt = `
    Project name: ${project.name || "N/A"}
    Website: ${project.website || "N/A"}
    Description: ${project.metatags?.description || project?.description || "N/A"}
    Language: ${language.label || "English (us)"}

    Seed keyword: ${seedKeyword}
    Related keywords: ${keywords.join(',')}
    Ranking competitors headline: ${competitorsHeadlines.join(',')}
    Ranking competitors headline description:
    ${descriptions.slice(0, 5).join('\n')}

    Title: ${body.title_mode === "Custom" ? body.title : "N/A"}
    Inspo Title: ${body.title_mode === "Inspo" ? body.title : "N/A"}
    Content type: ${body.content_type.replaceAll("_", " ")}
    Purpose: ${body.purpose.replaceAll("_", " ")}
    Tones: ${body.tones.join(",")}
    Clickbait: ${!!body.clickbait}
    Words count: ${body.words_count}
    Perspective: ${body.perspective}

    Include featured image: ${!!body.with_featured_image}
    Include introduction: ${!!body.with_introduction}
    Include conclusion: ${!!body.with_conclusion}
    Include key takeways: ${!!body.with_key_takeways}
    Include faq: ${!!body.with_faq}
    Add sections images: ${body.with_sections_image ? body.with_sections_image_mode : false}
    Image source: ${body.with_sections_image ? body.image_source : "N/A"}

    Additional information: ${body.additional_information}

    type Article = {
      ${body.title_mode !== "Custom" ? "title: string; // 60 characters maximum" : ""}
      meta_description: string; // between 50 and 160 characters
      featured_image_query?: string; // search query to find the article featured image from pexels or unsplash
      outlines: {
        type: "introduction" | "key_takeways" | "content_section" | "conclusion" | "faq";
        heading: string; // section title
        content_description: string; // a description of what the section content should contains
        words_count: number; // introduction is less than 150 words, conlusion is less than 250 words
        keywords: string[]; // list of related keywords to include in the content
        image_queries?: string[]; // list of search queries to find image(s) to include in the content from pexels or unsplash
        youtube_queries?: string[]; // list of search queries to find video(s) to include in the content youtube
      }[];
    }

    Sort the outlines in an order that makes sense.
    Your content is high in burstiness, low in complexitiy and highly readable.

    Write an article outline of type Article in JSON wrapped in \`\`\`json\`\`\`.`

    const { data: queuedArticle } = await supabase.from("blog_posts")
      .insert({
        ...body,
        seed_keyword: seedKeyword,
        status: "queue",
        keywords,
        prompt
      })
      .select("id")
      .single()
      .throwOnError();

    if (!queuedArticle) {
      return NextResponse.json({ message: "Article creation failed" }, { status: 500 });

    }

    const response = await client.publishJSON({
      url: process.env.NEXT_PUBLIC_API_PING || "",
      body: {
        payload: body,
        prompt,
        article: {
          id: queuedArticle.id,
          keywords,
        },
        project: {
          id: project.id,
          name: project.name,
          description: project?.metatags?.description || project?.description || "N/A",
          language
        }
      }
    });

    await supabase.from("blog_posts")
      .update({ message_id: response.messageId })
      .eq("id", queuedArticle.id)
      .throwOnError()

    return NextResponse.json(response, { status: 200 });
  } catch (e) {
    return NextResponse.json(e, { status: 500 })
  }
}