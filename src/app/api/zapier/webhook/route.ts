import { supabaseAdmin } from "@/helpers/supabase";
import { NextResponse } from "next/server";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");

export async function GET(request: Request) {
  try {
    // TODO: get all blog post with status "publishing" that are linked to the X-API-KEY
    return NextResponse.json([])
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json(body)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const apiKey = request.headers.get("X-API-KEY")
    return NextResponse.json({ apiKey })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error }, { status: 500 })
  }
}