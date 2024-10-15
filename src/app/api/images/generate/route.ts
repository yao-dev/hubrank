import { getAiImage } from "@/helpers/image";
import supabase from "@/helpers/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { deductCredits, getUserPremiumData } from "../../helpers";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { data: user } = await supabase().from("users").select("*, users_premium:users_premium!user_id(*)").eq("id", body.user_id).maybeSingle();
  user.premium = getUserPremiumData(user);

  if (!user.premium.words || user.premium.words < 100) {
    return NextResponse.json({ message: "Insufficient ai images" }, { status: 401 })
  }
  const data = await getAiImage(body);

  await deductCredits({
    userId: body.user_id,
    costInCredits: 1,
    featureName: "ai images",
    premiumName: "ai_images"
  });

  return NextResponse.json(data)
}