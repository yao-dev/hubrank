import { NextResponse } from "next/server";
import { AI, CaptionTemplate } from "@/app/api/AI";
import { checkCredits, deductCredits, getProjectContext, getWritingStyle, insertCaption } from "@/app/api/helpers";
import { supabaseAdmin } from "@/helpers/supabase";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // CHECK IF USER HAS ENOUGH CREDITS
    const creditCheck = {
      userId: body.user_id,
      costInCredits: 0.5,
      featureName: "caption"
    }
    await checkCredits(creditCheck);

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

    const context = getProjectContext({
      name: project.name,
      website: project.website,
      description: project.metatags?.description || project?.description,
      lang: language.label,
    })

    // FETCH WRITING STYLE IF IT EXISTS
    let writingStyle;
    if (body.writing_style_id) {
      writingStyle = await getWritingStyle(body.writing_style_id)
    }

    const ai = new AI({ context, writing_style: writingStyle });

    const metadata: CaptionTemplate = {
      goal: body.goal,
      with_hashtags: body.with_hashtags,
      with_emojis: body.with_emojis,
      caption_source: body.caption_source,
      tones: body.tones,
      purposes: body.purposes,
      emotions: body.emotions,
      vocabularies: body.vocabularies,
      sentence_structures: body.sentence_structures,
      perspectives: body.perspectives,
      writing_structures: body.writing_structures,
      instructional_elements: body.instructional_elements,
      caption_length: body.caption_length,
      with_single_emoji: body.with_single_emoji,
      with_question: body.with_question,
      with_hook: body.with_hook,
      with_cta: body.with_cta,
      cta: body.cta,
      language: language.label,
      platform: body.platform,
      description: body.description,
      external_sources: body.external_sources
    }

    const result = await ai.getCaption({
      ...metadata,
      platform: body.platform,
      description: body.description,
      writingStyle
    });

    await insertCaption({
      user_id: body.user_id as string,
      project_id: body.project_id as number,
      language_id: body.language_id as number,
      writing_style_id: body.writing_style_id as number,
      platform: body.platform as string,
      caption: result.caption as string,
      metadata
    });

    // DEDUCTS CREDITS FROM USER SUBSCRIPTION
    await deductCredits(creditCheck);

    return NextResponse.json(body, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(e, { status: 500 });
  }
}