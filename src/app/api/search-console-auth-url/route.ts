import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
// import serviceAccount from "../../../../service-account.json";
import chalk from "chalk";

export const getGoogleClient = (origin: string) => {
  const serviceAccount = {
    web: {
      client_id: "",
      client_secret: "",
    }
  }
  const oauth2Client = new google.auth.OAuth2(
    serviceAccount.web.client_id,
    serviceAccount.web.client_secret,
    `${origin}/auth/redirect-uri`
  );

  return oauth2Client
}

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin;
    const oauth2Client = getGoogleClient(origin)

    // generate a url that asks permissions for Blogger and Google Calendar scopes
    const scopes = "openid email profile https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/indexing";

    const url = oauth2Client.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: 'offline',
      response_type: "code",
      include_granted_scopes: true,
      scope: scopes
    });

    console.log(chalk.bgBlue(url))

    return NextResponse.json({ url })
  } catch (e) {
    console.log(e)
    return NextResponse.json({ url: "" })
  }
}