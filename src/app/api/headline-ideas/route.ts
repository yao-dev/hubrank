import { AI } from "../AI";
import { supabaseAdmin } from "@/helpers/supabase";
import { getSerpData } from "@/helpers/seo";
import { NextResponse } from "next/server";
import { compact } from "lodash";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const seedKeyword = body.seed_keyword;

    const { data: project } = await supabase.from("projects").select("*").eq("id", body.project_id).limit(1).single();

    if (!project) {
      return NextResponse.json({ message: "not project found" }, { status: 500 })
    }

    const { data: language } = await supabase.from("languages").select("*").eq("id", body.language_id).limit(1).single();
    const { data: serpDataForSeedKeyword } = await getSerpData({ keyword: seedKeyword, depth: 20, lang: language.code, location_code: language.location_code });

    if (serpDataForSeedKeyword?.tasks_error > 0 || !serpDataForSeedKeyword) {
      return NextResponse.json({ message: "error fetching competitors ranking for main keyword" }, { status: 500 })
    }

    const competitorsHeadlines = serpDataForSeedKeyword?.tasks[0].result
      .map((item: any) => {
        return item?.items
          .filter((subItem: any) => subItem.type === "organic")
          .map((subItem: any) => {
            return subItem.title
          })
      })
      .flat(Infinity)

    const context = `
  Project name: ${project.name || "N/A"}
  Website: ${project.website || "N/A"}
  Description: ${project.metatags?.description || project?.description || "N/A"}
  Language: ${language.label || "English (us)"}`

    const ai = new AI(context);
    const response = await ai.headlines({
      competitorsHeadlines,
      seedKeyword,
      purpose: body.purpose.replaceAll("_", " "),
      tone: body.tones.join(","),
      contentType: body.content_type.replaceAll("_", " "),
      clickbait: !!body.clickbait
    });

    const headlines = compact(response.split("\n"))

    return NextResponse.json({ headlines }, { status: 200 });
  } catch (e) {
    console.log(e)
    return NextResponse.json(e, { status: 500 })
  }
}