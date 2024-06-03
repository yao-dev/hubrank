import { supabaseAdmin } from "@/helpers/supabase";
import { NextResponse } from "next/server";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");

// When the user publish a blog
// the user id is sent in the request body
// use it to retrieve the zapier webhook url
// once retrieved, send a request to the webhook url
// with an array containing the blog post payload (see xample below)
// {
//   "id": 345,
//   "created_at": "2024-05-31 15:21:50.357459+00",
//   "html": "",
//   "markdown": "",
//   "title": "",
//   "seed_keyword": "",
//   "keywords": "",
//   "meta_description": "",
//   "featured_image": "",
//   "schema_markups": []
// }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json(body)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error }, { status: 500 })
  }
}