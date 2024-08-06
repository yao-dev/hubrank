import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/helpers/supabase";
import { updateCredits } from "../helpers";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");
export const maxDuration = 300;

export async function POST(request: Request) {
  const body = await request.json();

  try {
    switch (body.type) {
      case 'INSERT': {
        await updateCredits({ userId: body.record.id, credits: 5, action: 'replace' })
        break;
      }
    }

    return NextResponse.json({ message: "Users webhook success", body }, { status: 200 })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: "Users webhook error", error, body }, { status: 500 })
  }
}