import { supabaseAdmin } from "@/helpers/supabase";
import { NextResponse } from "next/server";
import { uuid } from "uuidv4";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");

export async function GET(request: Request) {
  try {
    const searchParams = new URLSearchParams(request.url);
    const redirect_uri = searchParams.get("redirect_uri") ?? "";
    const state = searchParams.get("state") ?? "";

    const redirectUrl = new URL(redirect_uri);
    redirectUrl.searchParams.append("state", state);
    redirectUrl.searchParams.append("code", uuid());


    console.log("zapier redirectUrl", redirectUrl.href)

    return NextResponse.redirect(redirectUrl.href);
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error }, { status: 500 })
  }
}