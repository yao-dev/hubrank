import { NextResponse } from "next/server";
import { getUserCredits } from "../helpers";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    let creditsRequired = 0;

    switch (body.action) {
      case 'write-blog-post':
      case 'write-pseo':
        creditsRequired = 1 + (body.extra ?? 0)
      case 'write-caption':
        creditsRequired = 0.5
      case 'schema-markup':
      case 'keyword-research':
        creditsRequired = 0.25
    }

    const userCredits = await getUserCredits(body.user_id);
    const authorized = userCredits >= creditsRequired;

    return NextResponse.json({ authorized })
  } catch (e) {
    console.log(e)
    return NextResponse.json({ authorized: false })
  }
}