import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_RECAPTCHA_SECRET_KEY ?? ""}&response=${body.token}`;
    const { data } = await axios.post(verifyUrl);
    console.log(data)
    return NextResponse.json({ success: data?.success })
  } catch (e) {
    console.log(e)
    return NextResponse.json(e)
  }
}