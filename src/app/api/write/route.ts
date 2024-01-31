import { supabaseAdmin } from "@/helpers/supabase";
import { NextResponse } from "next/server";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");

export async function POST(request: Request) {
  const body = await request.json();

  console.log(body);

  try {
    return NextResponse.json(body, { status: 200 })
  } catch (e) {
    return NextResponse.json(e, { status: 500 })
  }
}