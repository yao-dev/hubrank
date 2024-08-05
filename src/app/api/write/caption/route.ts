import { NextResponse } from "next/server";
import { AI, CaptionTemplate } from "@/app/api/AI";
import { deductCredits, getManualWritingStyle, getProjectContext, getSavedWritingStyle, getYoutubeTranscript, insertCaption } from "@/app/api/helpers";
import { supabaseAdmin } from "@/helpers/supabase";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = await request.json();

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
    let writingStyle = getManualWritingStyle(body);
    if (body.writing_style_id) {
      writingStyle = await getSavedWritingStyle(body.writing_style_id)
    }

    const ai = new AI({ context, writing_style: writingStyle });

    let youtubeTranscript;
    if (body.goal === "youtube_to_caption" && body.youtube_url) {
      youtubeTranscript = await getYoutubeTranscript(body.youtube_url)
    }

    const metadata: CaptionTemplate = {
      goal: body.goal,
      with_hashtags: body.with_hashtags,
      with_emojis: body.with_emojis,
      caption_source: body.caption_source,
      caption_length: body.caption_length,
      with_single_emoji: body.with_single_emoji,
      with_question: body.with_question,
      with_hook: body.with_hook,
      with_cta: body.with_cta,
      cta: body.cta,
      language: language.label,
      platform: body.platform,
      description: body.description,
      external_sources: body.external_sources,
      youtube_transcript: youtubeTranscript
    }

    const result = await ai.getCaption({
      ...metadata,
      platform: body.platform,
      description: body.description,
      writingStyle
    });

    const cost = 0.5

    await insertCaption({
      user_id: body.user_id as string,
      project_id: body.project_id as number,
      language_id: body.language_id as number,
      writing_style_id: body.writing_style_id as number,
      platform: body.platform as string,
      caption: result.caption as string,
      metadata,
      cost
    });

    // DEDUCTS CREDITS FROM USER SUBSCRIPTION
    const creditCheck = {
      userId: body.user_id,
      costInCredits: cost,
      featureName: "caption"
    }
    await deductCredits(creditCheck);

    return NextResponse.json(body, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(e, { status: 500 });
  }
}