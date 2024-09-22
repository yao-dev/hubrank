import { NextRequest, NextResponse } from "next/server";
import { publishBlogPost } from "../../helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data } = await publishBlogPost({ url: body.url, blogPost: body.blogPost })

    return NextResponse.json(data)
  } catch (e) {
    console.log(e)
  }
  return NextResponse.json({ error: true })
}