import { supabaseAdmin } from "@/helpers/supabase";
import { NextResponse } from "next/server";
import { AI } from "../AI";
import { getSummary } from 'readability-cyr';

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");

export async function POST(request: Request) {
  const body = await request.json();

  try {
    console.log(body);

    const ai = new AI();
    const wordsCount = await ai.sectionsWordCount(body)
    const outline = body.outline.join(', ');

    for (const [index, heading] of Object.entries(body.outline)) {
      let content = await ai.write({
        heading_prefix: "##",
        title: body.title,
        heading,
        // word_count: section.sub_sections ? sectionWithSubWordCount : section.word_count,
        word_count: wordsCount[index],
        outline
      });

      let stats = getSummary(content)

      if (stats.difficultWords >= 5 || stats.FleschKincaidGrade > 9) {
        content = await ai.rephrase(content);
      }

      ai.addArticleContent(content);
    }

    console.log(ai.article)

    return NextResponse.json({
      article: ai.article
    }, { status: 200 })
  } catch (e) {
    return NextResponse.json(e, { status: 500 })
  }
}