import { NextResponse } from "next/server";
import { nanoid } from 'nanoid';
import chalk from "chalk";



export async function POST(request: Request) {
  try {
    const {
      state,
      client_id,
      redirect_uri,
      code
    } = await request.json();

    const query = {
      state,
      client_id,
      // code: nanoid()
      code
    };
    const urlEncoded = new URLSearchParams(query).toString();
    const redirectUrl = `${redirect_uri}?${urlEncoded}`;

    console.log(chalk.yellow("[User consent accepted]: we redirect to Zapier redirect uri"), redirectUrl)

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error }, { status: 500 })
  }
}