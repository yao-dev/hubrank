import { NextResponse } from "next/server";
import { AI } from "../AI";

export async function POST(request: Request) {
  const body = await request.json();
  const ai = new AI()
  const writingCharacteristics = await ai.getWritingCharacteristics(body.text);
  return NextResponse.json({ writing_characteristics: writingCharacteristics })
}