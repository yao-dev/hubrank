import { supabaseAdmin } from "@/helpers/supabase";
import { NextResponse } from "next/server";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");

export async function GET(request: Request) {
  try {
    const bearerToken = request.headers.get("Authorization");
    console.log("[GET] webhook", { bearerToken })
    // TODO: get all blog post with status "publishing" that are linked to the X-API-KEY in the headers
    return NextResponse.json([])
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const bearerToken = request.headers.get("Authorization");
    console.log("[POST] webhook", { bearerToken })
    const body = await request.json();
    console.log("[POST] webhook", { body })

    // body.hookUrl

    return NextResponse.json(body)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const bearerToken = request.headers.get("Authorization");
    console.log("[DELETE] webhook", { bearerToken })
    return NextResponse.json({ bearerToken })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error }, { status: 500 })
  }
}