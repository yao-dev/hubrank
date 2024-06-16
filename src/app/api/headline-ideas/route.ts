import { supabaseAdmin } from "@/helpers/supabase";
import { getRelatedKeywords } from "@/helpers/seo";
import { NextResponse } from "next/server";
import { compact } from "lodash";
import { getHeadlines, getProjectContext, getWritingStyle } from "../helpers";

export const maxDuration = 45;

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const seedKeyword = body.seed_keyword;

    const [
      { data: project },
      { data: language },
    ] = await Promise.all([
      supabase.from("projects").select("*").eq("id", body.project_id).single(),
      supabase.from("languages").select("*").eq("id", body.language_id).single()
    ])

    if (!project) {
      return NextResponse.json({ message: "project not found" }, { status: 500 })
    }
    if (!language) {
      return NextResponse.json({ message: "language not found" }, { status: 500 })
    }

    const { data: relatedKeywords } = await getRelatedKeywords({ keyword: seedKeyword, depth: 2, limit: 50, api: true, lang: language.code, location_code: language.location_code })

    if (relatedKeywords?.tasks_error > 0 || !relatedKeywords) {
      return NextResponse.json({ message: "error fetching related keywords" }, { status: 500 })
    }

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

    keywords = [...new Set(Object.keys(keywords))].slice(0, 30);

    const context = getProjectContext({
      name: project.name,
      website: project.website,
      description: project.metatags?.description || project?.description,
      lang: language.label,
    })

    let writingStyle;
    if (body.writing_mode === "custom") {
      writingStyle = await getWritingStyle(body.writing_style_id)
    }

    const headlines = await getHeadlines({
      language,
      context,
      writingStyle,
      purpose: body.purpose,
      tone: body.tones,
      contentType: body.content_type,
      clickbait: body.clickbait,
      isInspo: body.title_mode === "inspo",
      inspoTitle: body.title_mode === "inspo" && body.inspo_title,
      count: 1
    });

    return NextResponse.json({ headlines, keywords }, { status: 200 });
  } catch (e) {
    console.log(e)
    return NextResponse.json(e, { status: 500 })
  }
}