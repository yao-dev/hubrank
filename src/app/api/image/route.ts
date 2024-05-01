import { NextResponse } from "next/server";
import { findImage } from "../helpers";

export async function POST(request: Request) {
  const body = await request.json();
  const image = await findImage(body.query)
  return NextResponse.json({ image })
}