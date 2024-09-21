import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data } = await axios.post(body.url, body.blogPost, {
      headers: {
        Authorization: `Bearer ${process.env.ZAPIER_TOKEN ?? ''}`
      }
    });

    return NextResponse.json(data)
  } catch (e) {
    console.log(e)
  }
  return NextResponse.json({ ping: true })
}