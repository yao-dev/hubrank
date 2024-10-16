import { NextRequest, NextResponse } from "next/server";
import chalk from "chalk";
import parseUrl from "parse-url";

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log(chalk.yellow("url received from zapier"), request.url)
    const parsedUrl = parseUrl(request.url)
    console.log(chalk.yellow("parsedUrl"), JSON.stringify(parsedUrl, null, 2))

    const query = {
      install_zapier: true,
      state: parsedUrl.query.state,
      client_id: process.env.NEXT_PUBLIC_ZAPIER_CLIENT_ID ?? "",
      integration_name: parsedUrl.query.integration_name,
      redirect_uri: parsedUrl.query.redirect_uri
    };

    console.log(chalk.yellow("query object"), JSON.stringify(query, null, 2))

    const urlEncoded = new URLSearchParams(query).toString();
    const protocol = process.env.NODE_ENV === "development" ? "http:" : "https:"
    const redirectUrl = `${protocol}//app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}?${urlEncoded}`;

    console.log(chalk.yellow("[Request permission dialog]: we redirect to consent page in Hubrank"), redirectUrl)

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error }, { status: 500 })
  }
}