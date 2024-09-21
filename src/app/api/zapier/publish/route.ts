import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const r = await axios.post(body.url, body.blogPost, {
      headers: {
        Authorization: "Bearer a7047301-d0fe-4d18-8c81-105b84ab49da"
      }
    });

    return NextResponse.json(r.data)
  } catch (e) {
    console.log(e)
  }
  return NextResponse.json({ ping: true })
}