import { NextResponse } from "next/server";
import {
  deductCredits,
  getIsTwitterUrl,
  getIsYoutubeUrl,
  getManualWritingStyle,
  getSavedWritingStyle,
  getTweets,
  getYoutubeTranscript,
} from "@/app/api/helpers";
import Anthropic from "@anthropic-ai/sdk";
import { getSerp } from "@/helpers/seo";
import { compact, omit, shuffle } from "lodash";
import axios from "axios";
import * as cheerio from "cheerio";
import supabase from "@/helpers/supabase/server";
import dJSON from "dirty-json";
import { models } from "../../AI";
import OpenAI from "openai";

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data: project } = await supabase().from("projects").select("*").eq("id", body.project_id).maybeSingle();

    if (!project) {
      return NextResponse.json({ message: "project not found" }, { status: 500 })
    }

    const { data: language } = await supabase().from("languages").select("*").eq("id", project.language_id).maybeSingle()

    if (!language) {
      return NextResponse.json({ message: "language not found" }, { status: 500 })
    }

    // const context = getProjectContext({
    //   name: project.name,
    //   website: project.website,
    //   description: project.metatags?.description || project?.description,
    //   lang: language.label,
    // })

    // FETCH WRITING STYLE IF IT EXISTS
    let writingStyle = getManualWritingStyle(body);
    if (body.writing_style_id) {
      writingStyle = await getSavedWritingStyle(body.writing_style_id)
    }

    let youtubeTranscript;
    if (body.goal === "youtube_to_caption" && body.youtube_url) {
      youtubeTranscript = await getYoutubeTranscript(body.youtube_url)
    }

    // const metadata: CaptionTemplate = {
    //   goal: body.goal,
    //   with_hashtags: body.with_hashtags,
    //   with_emojis: body.with_emojis,
    //   caption_source: body.caption_source,
    //   caption_length: body.caption_length,
    //   with_single_emoji: body.with_single_emoji,
    //   with_question: body.with_question,
    //   with_hook: body.with_hook,
    //   with_cta: body.with_cta,
    //   cta: body.cta,
    //   language: language.label,
    //   platform: body.platform,
    //   description: body.description,
    //   external_sources: body.external_sources,
    //   youtube_transcript: youtubeTranscript
    // }

    // const ai = new AI({
    //   ai_mode: "anthropic",
    //   system: "You write like we would talk in a conversation (like a human)",
    //   writing_style: writingStyle,
    // });

    // const result = await ai.getCaption({
    //   ...metadata,
    //   platform: body.platform,
    //   description: body.description,
    //   writingStyle,
    // });

    // DEDUCTS CREDITS FROM USER SUBSCRIPTION
    const cost = 0.5
    const creditCheck = {
      userId: body.user_id,
      costInCredits: cost,
      featureName: "caption"
    }
    await deductCredits(creditCheck);

    let inspo;
    let source;

    if (!body.source && body.type !== "comment") {
      const query = [...body.keywords.split(","), ...body.hashtags.split(" ")].map((keyword) => `"${keyword}"`).join(" OR ");
      console.log("SERP QUERY", `site:x.com ${query} inurl:status`)
      const serp = await getSerp({ query: `site:instagram.com/p ${query}`, languageCode: language.code, locationCode: language.location_code, count: 25, depth: 10 });
      const randomFiveTweets = shuffle(serp).slice(0, 5);
      const result = await Promise.all(randomFiveTweets.map(async (item) => await axios.get(item.url)))

      inspo = result.map((item) => {
        if (item.data) {
          const $ = cheerio.load(item.data);
          return $('meta[name="description"]').attr('content')
        }

        return;
      })

      inspo = compact(inspo)

      console.log("inspo", inspo)
    }

    if (body.type !== "comment") {
      if (getIsYoutubeUrl(body.source)) {
        source = await getYoutubeTranscript(body.source);
      }
      if (getIsTwitterUrl(body.source)) {
        source = await getTweets([body.source]);
      }
    }

    const ai = new Anthropic({
      baseURL: "https://anthropic.hconeai.com/",
      apiKey: process.env.ANTHROPIC_API_KEY, // defaults to process.env["ANTHROPIC_API_KEY"]
      defaultHeaders: {
        "Helicone-Auth": `Bearer ${process.env.HELICONE_AUTH}`,
      },
    });


    const completion = await ai.messages.create({
      // model: opts.model || "claude-3-5-sonnet-20240620",
      model: models.sonnet,
      max_tokens: 1000,
      temperature: body.type === "Comment" ? 0.3 : 0.1,
      system: "Act as a social media marketer",
      messages: [{
        role: 'user',
        content: compact([
          JSON.stringify(omit(body, ["user_id", "project_id", "source"]), null, 2),
          source && `Source:\n${JSON.stringify(source, null, 2)}`,
          inspo && `Inspo:\n${JSON.stringify(inspo, null, 2)}`,
          body.type === "Comment" ? "Write 5 comments in response to the source" : "Write 5 captions",
          "Your writing is well formatted with paragraphs, tabs, list, etc.\nOutput only a JSON array string[] with the results nothing else",
        ]).join('\n\n')
      }]
    });

    // console.log(completion);
    const captions = dJSON.parse(completion.content[0].text)


    // await insertCaption({
    //   user_id: body.user_id as string,
    //   project_id: body.project_id as number,
    //   language_id: body.language_id as number,
    //   writing_style_id: body.writing_style_id as number,
    //   platform: body.platform as string,
    //   caption: result.caption as string,
    //   metadata,
    //   cost
    // });

    return NextResponse.json({ captions }, { status: 200 });
  } catch (e: any) {
    console.log(e?.message)
    return NextResponse.json(e, { status: 500 });
  }
}