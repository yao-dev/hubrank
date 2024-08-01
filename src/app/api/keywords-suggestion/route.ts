import { getRelatedKeywords } from "@/helpers/seo";
import { checkCredits, deductCredits } from "../helpers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const creditsCheckOptions = {
      userId: body.userId,
      costInCredits: 0.25,
      featureName: "keyword-suggestion"
    }
    const keywords = await getRelatedKeywords({ keyword: body.query, depth: 4, limit: 1000, lang: body.lang, location_code: body.locationCode });
    await deductCredits(creditsCheckOptions)
    return NextResponse.json(keywords)
  } catch (e: any) {
    return NextResponse.json(e, { status: 500 })
  }
}