import { NextResponse } from "next/server";
import { updateCredits } from "../../helpers";
import { deleteSchedule } from "@/helpers/qstash";
import { differenceInYears } from "date-fns";
import { get } from "lodash";
import supabase from "@/helpers/supabase/server";


export const maxDuration = 30;

export async function POST(request: Request) {
  const body = await request.json();

  try {
    const { data: appsumo } = await supabase().from("appsumo_code").select().eq("id", body.id).maybeSingle().throwOnError();
    // - check if appsumo_code (redeem_date vs now() is at least a year)
    if (Math.abs(differenceInYears(body.redeem_date, new Date())) >= 1) {
      // delete cron schedule
      await deleteSchedule(appsumo.schedule_id);
      await supabase().from("appsumo_code").update({ schedule_id: "" }).eq("id", appsumo.id)
    } else {
      // - if user has subscription add 100 credits to the user
      // - replace user current credits with 100 credits otherwise
      const { data: user } = await supabase().from("users").select().eq("id", body.user_id).maybeSingle().throwOnError();
      const hasSubscription = !!get(user, "subscription.plan.id");
      await updateCredits({ userId: body.user_id, credits: 100, action: hasSubscription ? "increment" : "replace" })
    }

    return NextResponse.json({ message: "Appsumo update credits success", body }, { status: 200 })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: "Appsumo update credits error", error, body }, { status: 500 })
  }
}