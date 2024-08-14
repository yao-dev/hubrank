import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import serviceAccount from "../../../../service-account.json";

export const getGoogleClient = (origin: string) => {
  const oauth2Client = new google.auth.OAuth2(
    serviceAccount.web.client_id,
    serviceAccount.web.client_secret,
    `${origin}/auth/redirect-uri`
  );

  return oauth2Client
}

export async function GET(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin;
    const oauth2Client = getGoogleClient(origin)

    // generate a url that asks permissions for Blogger and Google Calendar scopes
    const scopes = [
      "https://www.googleapis.com/auth/webmasters",
      "https://www.googleapis.com/auth/indexing",
      // "openid",
      // "https://www.googleapis.com/auth/userinfo.email",
      // "https://www.googleapis.com/auth/userinfo.profile"
    ];

    const url = oauth2Client.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: 'online',
      response_type: "code",
      // If you only need one scope you can pass it as a string
      scope: scopes
    });

    return NextResponse.json({ url })
  } catch (e) {
    console.log(e)
    return NextResponse.json({ url: "" })
  }
}