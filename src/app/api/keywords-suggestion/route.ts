import { getRelatedKeywords } from "@/helpers/seo";
import { deductCredits, getUserPremiumData } from "../helpers";
import { NextRequest, NextResponse } from "next/server";
import supabase from "@/helpers/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data: user } = await supabase().from("users").select("*, users_premium:users_premium!user_id(*)").eq("id", body.userId).maybeSingle();
    user.premium = getUserPremiumData(user);

    if (!user.premium.keywords_research) {
      return NextResponse.json({ message: "Insufficient keywords research" }, { status: 401 })
    }

    const keywords = await getRelatedKeywords({ keyword: body.query, depth: 4, limit: 1000, lang: body.lang, location_code: body.locationCode });
    await deductCredits({
      userId: body.userId,
      costInCredits: 1,
      featureName: "keyword-suggestion",
      premiumName: "keywords_research"
    });
    return NextResponse.json(keywords)
  } catch (e: any) {
    return NextResponse.json(e, { status: 500 })
  }
}