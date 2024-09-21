import { NextRequest, NextResponse } from "next/server";
import chalk from "chalk";

export async function GET(request: NextRequest) {
  try {
    console.log(chalk.yellow("url received from zapier"), request.url)
    console.log();
    const redirect_uri = request.nextUrl.searchParams.get("redirect_uri") ?? "";
    console.log(chalk.yellow("redirect uri"), redirect_uri)

    const query = {
      install_zapier: true,
      state: request.nextUrl.searchParams.get("state") ?? "",
      client_id: process.env.NEXT_PUBLIC_ZAPIER_CLIENT_ID ?? "",
      redirect_uri,
    };
    const urlEncoded = Object.entries(query).map(([key, value]) => `${key}=${value}`).join("&");
    const protocol = process.env.NODE_ENV === "development" ? "http:" : "https:"
    const redirectUrl = `${protocol}//app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/projects?${urlEncoded}`;

    console.log(chalk.yellow("[Request permission dialog]: we redirect to consent page in Hubrank "), redirectUrl)

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error }, { status: 500 })
  }
}