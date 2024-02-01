import { AI } from "../AI";
import { supabaseAdmin } from "@/helpers/supabase";
import { NextResponse } from "next/server";
import { compact } from "lodash";
import { getRelatedKeywords } from "@/helpers/seo";

export const maxDuration = 60;

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const seedKeyword = body.seed_keyword;

    const { data: project } = await supabase.from("projects").select("*, languages!language_id(*)").eq("id", body.project_id).limit(1).single();

    if (!project) {
      return NextResponse.json({ message: "not project found" }, { status: 500 })
    }

    const { data: language } = await supabase.from("languages").select("*").eq("id", body.language_id).limit(1).single();
    const { data: relatedKeywords } = await getRelatedKeywords({ keyword: seedKeyword, depth: 2, limit: 50, api: true, lang: language.code, location_code: language.location_code });

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

    keywords = Object.keys(keywords).slice(0, 20);

    const context = `
  Project name: ${project.name || "N/A"}
  Website: ${project.website || "N/A"}
  Description: ${project.metatags?.description || project?.description || "N/A"}
  Language: ${project.languages.label || "English (us)"}`

    const ai = new AI(context);
    const outline = await ai.outlines({
      seed_keyword: body.seed_keyword,
      title: body.title,
      heading_count: body.heading_count,
      introduction: body.introduction,
      conclusion: body.conclusion,
      key_takeways: body.key_takeways,
      faq: body.faq,
      word_count: body.word_count,
      language: language.label,
      keywords
    })

    return NextResponse.json({ outline }, { status: 200 });
  } catch (e) {
    console.log(e)
    return NextResponse.json(e, { status: 500 })
  }
}