import { supabaseAdmin } from "@/helpers/supabase";
import { NextResponse } from "next/server";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");

const getHeaderAccessToken = (bearerToken: string | null = "") => {
  const accessToken = bearerToken?.split(" ")?.[1] ?? ""
  return accessToken
}

export async function GET(request: Request) {
  try {
    const accessToken = getHeaderAccessToken(request.headers.get("Authorization"))
    const searchParams = new URLSearchParams(request.url);
    const trigger = searchParams.get("trigger") ?? "";
    console.log("[GET] webhook", { accessToken, trigger })
    // TODO: get all blog post with status "publishing" that are linked to the X-API-KEY in the headers
    return NextResponse.json([])
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error }, { status: 500 })
  }
}

// Webhook subscribe triggers when the user TURN ON a zap that he has created
// hookUrl will be sent in the request.body it correspond to the webhook Zapier give us to trigger
// our Zap trigger like "Publish blog post"
// You can find the user access_token in the "Authorization" header of the request
// This will help retrieve the user in the database
export async function POST(request: Request) {
  try {
    const accessToken = getHeaderAccessToken(request.headers.get("Authorization"))
    const body = await request.json();
    console.log("[POST] webhook", { accessToken, body })

    return NextResponse.json(body)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error }, { status: 500 })
  }
}

// Webhook unsubscribe triggers when the user TURN OFF or delete a zap
// The integration or hookUrl must be deleted?
export async function DELETE(request: Request) {
  try {
    const accessToken = getHeaderAccessToken(request.headers.get("Authorization"));
    const body = await request.json();
    console.log("[DELETE] webhook", { accessToken, body })
    return NextResponse.json(body)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error }, { status: 500 })
  }
}