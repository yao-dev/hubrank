import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({
      attempt: '0192046a-b855-37c7-d512-d5a1a9c6f6e7',
      id: '0192046a-b855-37c7-d512-d5a1a9c6f6e7',
      request_id: '0192046a-b855-37c7-d512-d5a1a9c6f6e7',
      status: 'success'
    })
  } catch (e) {
    console.log(e)
  }
  return NextResponse.json({ ping: true })
}