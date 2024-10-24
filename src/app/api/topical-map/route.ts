import { getRelatedKeywords } from "@/helpers/seo";
import { deductCredits, getTopicalMapPrompt, getTopicalMapSchema, getUserPremiumData } from "../helpers";
import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import supabase from "@/helpers/supabase/server";

export const maxDuration = 90;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data: user } = await supabase().from("users").select("*, users_premium:users_premium!user_id(*)").eq("id", body.user_id).maybeSingle();
    user.premium = getUserPremiumData(user);

    if (!user.premium.keywords_research) {
      return NextResponse.json({ message: "Insufficient keywords research" }, { status: 401 })
    }

    let keywords = await getRelatedKeywords({ keyword: body.primary_keyword, depth: 2, limit: 250, lang: body.lang, location_code: body.locationCode });
    keywords = keywords?.map((item: any) => {
      // const word_count = item.keyword_data.keyword.split(" ").length;
      return {
        // language_id: values.language_id,
        keyword: item.keyword_data.keyword,
        search_volume: item.keyword_data.keyword_info.search_volume,
        competition_level: item.keyword_data.keyword_info.competition_level || "",
        keyword_difficulty: item.keyword_data.keyword_properties.keyword_difficulty,
        search_intent: item.keyword_data.search_intent_info.main_intent || "",
        // word_count,
        // longtail: word_count >= 4
      }
    });

    let { object: topicalMap } = await generateObject({
      output: "array",
      model: openai("gpt-4o"),
      // model: groq("llama-3.1-70b-versatile"),
      // model: groq("gemma2-9b-it"),
      // model: groq("llama-3.2-3b-preview"), // it is very fast ~3secs
      temperature: 0.3,
      schemaName: "topical_map",
      schema: getTopicalMapSchema(),
      prompt: getTopicalMapPrompt({
        primaryKeyword: body.primary_keyword,
        keywords,
        topicsCount: body.topics_count ?? 5,
        subTopicsPerTopicCount: body.sub_topics_per_topics_count ?? 5,
      }),
    });

    await deductCredits({
      userId: body.user_id,
      costInCredits: 1,
      featureName: "topical-map",
      premiumName: "keywords_research"
    });
    return NextResponse.json(topicalMap)
  } catch (e: any) {
    return NextResponse.json(e, { status: 500 })
  }
}