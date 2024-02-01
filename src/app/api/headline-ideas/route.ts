import { AI } from "../AI";
import { supabaseAdmin } from "@/helpers/supabase";
import { getRelatedKeywords, getSerpData } from "@/helpers/seo";
import { NextResponse } from "next/server";
import { compact } from "lodash";

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
    const [
      { data: serpDataForSeedKeyword },
      { data: relatedKeywords },
    ] = await Promise.all([
      getSerpData({ keyword: seedKeyword, depth: 20, lang: language.code, location_code: language.location_code }),
      getRelatedKeywords({ keyword: seedKeyword, depth: 2, limit: 50, api: true, lang: language.code, location_code: language.location_code })
    ])

    if (serpDataForSeedKeyword?.tasks_error > 0 || !serpDataForSeedKeyword) {
      return NextResponse.json({ message: "error fetching competitors ranking for main keyword" }, { status: 500 })
    }

    if (relatedKeywords?.tasks_error > 0 || !relatedKeywords) {
      return NextResponse.json({ message: "error fetching related keywords" }, { status: 500 })
    }

    const competitorsHeadlines = serpDataForSeedKeyword?.tasks[0].result
      .map((item: any) => {
        return item?.items
          .filter((subItem: any) => subItem.type === "organic")
          .map((subItem: any) => {
            return subItem.title
          })
      })
      .flat(Infinity);

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

    const context = `
  Project name: ${project.name || "N/A"}
  Website: ${project.website || "N/A"}
  Description: ${project.metatags?.description || project?.description || "N/A"}
  Language: ${language.label || "English (us)"}`;

    let writingStyle;

    if (body.writing_mode === "custom") {
      const { data: selectedWritingStyle } = await supabase.from("writing_styles").select("*").eq("id", body.writing_style_id).single();
      writingStyle = selectedWritingStyle.source_value;
    }

    const ai = new AI(context);
    const response = await ai.headlines({
      competitorsHeadlines,
      seedKeyword,
      purpose: body.purpose,
      tone: body.tones,
      contentType: body.content_type,
      clickbait: body.clickbait,
      writingStyle,
      isInspo: body.title_mode === "inspo",
      inspoTitle: body.title_mode === "inspo" && body.inspo_title,
    });

    const headlines = compact(response.split("\n"))

    return NextResponse.json({ headlines, keywords }, { status: 200 });
  } catch (e) {
    console.log(e)
    return NextResponse.json(e, { status: 500 })
  }
}