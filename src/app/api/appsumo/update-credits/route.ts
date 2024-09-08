import { NextResponse } from "next/server";
import { updateCredits } from "../../helpers";
import { deleteSchedule } from "@/helpers/qstash";
import { differenceInYears } from "date-fns";
import { supabaseAdmin } from "@/helpers/supabase";
import { get } from "lodash";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");
export const maxDuration = 30;

export async function POST(request: Request) {
  const body = await request.json();

  try {
    // - check if appsumo_code (redeem_date vs now() is less than a year)
    if (differenceInYears(body.redeem_date, new Date()) >= 1) {
      // delete cron schedule
      const { data: appsumo } = await supabase.from("appsumo_code").select().eq("id", body.id).maybeSingle().throwOnError();
      await deleteSchedule(appsumo.schedule_id);
    } else {
      // - if user has subscription add 100 credits to the user
      // - replace user current credits with 100 credits otherwise
      const { data: user } = await supabase.from("users").select().eq("id", body.user_id).maybeSingle().throwOnError();
      const hasSubscription = !!get(user, "subscription.plan.id");
      await updateCredits({ userId: body.user_id, credits: 100, action: hasSubscription ? "increment" : "replace" })
    }

    return NextResponse.json({ message: "Appsumo update credits success", body }, { status: 200 })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: "Appsumo update credits error", error, body }, { status: 500 })
  }
}