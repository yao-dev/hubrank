import { NextResponse } from "next/server";
import { getUpstashDestination, updateCredits } from "../helpers";
import { createSchedule } from "@/helpers/qstash";
import { supabaseAdmin } from "@/helpers/supabase";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");
export const maxDuration = 30;

export async function POST(request: Request) {
  const body = await request.json();

  try {
    switch (body.type) {
      case 'UPDATE': {
        if (!body.old_record.user_id && body.record.user_id) {
          await updateCredits({ userId: body.record.user_id, credits: 100, action: "increment" });
          // start a cron that will call an endpoint monthly
          const scheduleId = await createSchedule({
            destination: getUpstashDestination("api/appsumo/update-credits"),
            body: body.record,
            headers: {
              // "Upstash-Cron": "0 0 1 * *", // run on the 1st day of each month
              "Upstash-Cron": "*/2 * * * *", // run on the 1st day of each month
            }
          });
          await supabase.from("appsumo_code").update({ schedule_id: scheduleId }).eq("id", body.record.id);
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