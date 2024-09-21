import chalk from "chalk";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import supabase from "@/helpers/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()

    console.log(chalk.yellow("oauth/token [url]:"), request.url)
    const integrationId = form.get("code") as string;
    console.log(chalk.yellow(`oauth/token [integration_id]: ${integrationId}`))
    const { data: integration } = await supabase().from("integrations").select().eq("id", +integrationId).maybeSingle()
    const token = jwt.sign(integration, form.get("client_secret") as string);
    console.log(chalk.yellow("oauth/token [token]:"), token)

    const body = {
      access_token: token,
      refresh_token: token,
    }

    console.log("oauth/token: body", chalk.yellow(JSON.stringify(body, null, 2)))

    return NextResponse.json(body)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error }, { status: 500 })
  }
}