import { AI } from "../AI";
import { supabaseAdmin } from "@/helpers/supabase";
import { NextResponse } from "next/server";

export const maxDuration = 60;

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data: project } = await supabase.from("projects").select("*, languages!language_id(*)").eq("id", body.project_id).limit(1).single();

    if (!project) {
      return NextResponse.json({ message: "not project found" }, { status: 500 })
    }

    const { data: language } = await supabase.from("languages").select("*").eq("id", body.language_id).limit(1).single();

    const context = `
  Project name: ${project.name || "N/A"}
  Website: ${project.website || "N/A"}
  Description: ${project.metatags?.description || project?.description || "N/A"}
  Language: ${project.languages.label || "English (us)"}`

    const ai = new AI({ context });
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
      keywords: body.keywords
    })

    return NextResponse.json({ outline }, { status: 200 });
  } catch (e) {
    console.log(e)
    return NextResponse.json(e, { status: 500 })
  }
}