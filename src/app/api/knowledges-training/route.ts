import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/helpers/supabase";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");
export const maxDuration = 180;

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({}, { status: 200 });
}