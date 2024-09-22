import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const decoded = atob(body.sourceBody);
    console.log("schedule-callback", decoded)

    return NextResponse.json(body)
  } catch (e) {
    console.log(e)
    return NextResponse.json({ error: true })
  }
}