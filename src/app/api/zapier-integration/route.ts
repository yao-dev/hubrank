import { supabaseAdmin } from "@/helpers/supabase";
import { NextResponse } from "next/server";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // body.code
    // body.client_id
    // body.client_secret
    // body.grant_type
    // body.redirect_uri

    console.log(body);

    return NextResponse.json({
      access_token: "dfojkdaklsndkoijolisdjfkmdas"
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error }, { status: 500 })
  }
}