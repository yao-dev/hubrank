import { NextResponse } from "next/server";
import { getUpstashDestination, updateCredits } from "../helpers";
import { createSchedule } from "@/helpers/qstash";
import supabase from "@/helpers/supabase/server";
import { upsertUserPremiumData } from "@/features/payment/helpers/handle-webhook-event";

export const maxDuration = 30;

export async function POST(request: Request) {
  const body = await request.json();

  try {
    switch (body.type) {
      case 'UPDATE': {
        if (!body.old_record.user_id && body.record.user_id) {
          const { data: user } = await supabase().from("users").select().eq("id", body.record.user_id).maybeSingle();
          await upsertUserPremiumData({
            customerId: user.customer_id,
            words: 225000,
            keywords_research: 75,
            ai_images: 450
          });
        }
        break;
      }
    }

    return NextResponse.json({ message: "Appsumo webhook success", body }, { status: 200 })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: "Appsumo webhook error", error, body }, { status: 500 })
  }
}