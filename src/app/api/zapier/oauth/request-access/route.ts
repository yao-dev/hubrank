import { NextRequest, NextResponse } from "next/server";
import chalk from "chalk";

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log(chalk.yellow("url received from zapier"), request.url)
    const searchParams = new URLSearchParams(request.url);
    const redirect_uri = searchParams.get("redirect_uri") ?? "";
    console.log(chalk.yellow("redirect uri"), redirect_uri)

    const query = {
      install_zapier: true,
      state: searchParams.get("state") ?? "",
      client_id: process.env.NEXT_PUBLIC_ZAPIER_CLIENT_ID ?? "",
      redirect_uri,
    };
    const urlEncoded = new URLSearchParams(query).toString();
    const protocol = process.env.NODE_ENV === "development" ? "http:" : "https:"
    const redirectUrl = `${protocol}//app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}?${urlEncoded}`;

    console.log(chalk.yellow("[Request permission dialog]: we redirect to consent page in Hubrank "), redirectUrl)

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error }, { status: 500 })
  }
}