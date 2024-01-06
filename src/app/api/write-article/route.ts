import { getCompletion } from "@/helpers/gpt";
import { getImage } from "@/helpers/image";
import { getRelatedKeywords, getSerpData } from "@/helpers/seo";
import { supabaseAdmin } from "@/helpers/supabase";
import { compact } from "lodash";
import { NextResponse } from "next/server";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");

export async function POST(request: Request) {
  const body = await request.json();
  const seedKeyword = body.seed_keyword[0];

  const [{ data: relatedKeywords }, { data: serpDataForSeedKeyword }] = await Promise.all([
    getRelatedKeywords({ keyword: seedKeyword, depth: 2, limit: 50 }),
    getSerpData({ keyword: seedKeyword, depth: 20 })
  ])

  if (relatedKeywords?.tasks_error > 0 || !relatedKeywords) {
    return NextResponse.json({ message: "error fetching related keywords" }, { status: 500 })
  }
  if (serpDataForSeedKeyword?.tasks_error > 0 || !serpDataForSeedKeyword) {
    return NextResponse.json({ message: "error fetching competitors ranking for seed keyword" }, { status: 500 })
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

    const { data: project } = await supabase.from("projects").select("*").eq("id", body.project_id).limit(1).single().throwOnError()

    if (!project) {
      return NextResponse.json({ message: "not project found" }, { status: 500 })
    }

    // TODO: call openai to generate title + outline
    const prompt = `
    Project name: ${project.name || "N/A"}
    Website: ${project.website || "N/A"}
    Description: ${project.metatags?.description || project?.description || "N/A"}

    Seed keyword: ${seedKeyword}
    Related keywords: ${keywords.join(',')}
    Ranking competitors headline: ${competitorsHeadlines.join(',')}
    Ranking competitors headline description:
    ${descriptions.slice(0, 5).join('\n')}

    Title: N/A
    Content type: ${body.content_type.replaceAll("_", " ")}
    Purpose: ${body.purpose.replaceAll("_", " ")}
    Tones: ${body.tones.join(",")}
    Clickbait: ${!!body.clickbait}
    Words count: ${body.words_count}

    Include featured image: ${!!body.with_featured_image}
    Include introduction: ${!!body.with_introduction}
    Include conclusion: ${!!body.with_conclusion}
    Include key takeways: ${!!body.with_key_takeways}
    Include faq: ${!!body.with_faq}
    Add sections images: ${body.with_sections_image ? body.with_sections_image_mode : false}
    Image source: ${body.with_sections_image ? body.image_source : "N/A"}

    Additional information: ${body.additional_information}

    type Article = {
      title: string;
      meta_description: string; // between 50 and 160 characters
      featured_image_query?: string; search query to find the article featured image from pexels or unsplash
      outlines: {
        content_type: "introduction" | "key_takeways" | "faq" | "conclusion" | "content_section";
        content_description: string; // a description of what the section content should contains
        words_count: number; // introduction is less than 150 words, conlusion is less than 250 words
        keywords: string[]; // list of related keywords to include in the content
        image_queries?: string[]; // list of search queries to find image(s) to include in the content from pexels or unsplash
        youtube_queries?: string[]; // list of search queries to find video(s) to include in the content youtube
      }[];
    }

    Write an article outline of type Article in JSON wrapped in \`\`\`json\`\`\`.`

    let result: any = await getCompletion(prompt, {
      model: "gpt-4-1106-preview",
      temperature: 1,
      max_tokens: 1500,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // result = result.replace("```json", "").replace("```", "");
    result = result.slice(7, -3)
    result = JSON.parse(result);

    const images = [];

    const { data: featuredImages } = await getImage("unsplash", result?.featured_image_query || "")

    for (const outline of result.outlines) {
      if (outline.image_queries) {
        for (const imageQuery of outline.image_queries) {
          const sectionsImages = await getImage("unsplash", imageQuery || "")
          images.push(sectionsImages)
        }
      }
    }

    // const { data: queuedArticle } = await supabase.from("blog_posts")
    //   .insert({
    //     ...body,
    //     seed_keyword: seedKeyword,
    //     status: "queue",
    //     keywords
    //   })
    //   .select("*")
    //   .limit(1)
    //   .single()
    //   .throwOnError()

    return NextResponse.json({ prompt, result, featuredImages, images }, { status: 500 })
    // return NextResponse.json(queuedArticle, { status: 200 })
  } catch (e) {
    return NextResponse.json(e, { status: 500 })
  }
}