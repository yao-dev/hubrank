import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const oauth2 = google.oauth2('v2');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // const origin = req.nextUrl.origin;
    // const oauth2Client = getGoogleClient(origin);

    // // oauth2Client.setCredentials({ access_token: body.access_token })
    // google.options({ auth: oauth2Client });

    const { data } = await oauth2.tokeninfo({
      access_token: body.access_token
    });
    return NextResponse.json({ data })
  } catch (e) {
    console.log(e)
    return NextResponse.json({ data: null })
  }
}