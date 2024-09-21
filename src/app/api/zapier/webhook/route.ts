import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import chalk from "chalk";
import supabase from "@/helpers/supabase/server";

const getHeaderAccessToken = (bearerToken: string | null = "") => {
  const accessToken = bearerToken?.split(" ")?.[1] ?? ""
  return accessToken
}

export async function GET(request: Request) {
  try {
    const accessToken = getHeaderAccessToken(request.headers.get("Authorization"))
    const searchParams = new URLSearchParams(request.url);
    const trigger = searchParams.get("trigger") ?? "";
    console.log("[GET] webhook", { accessToken, trigger, url: request.url })
    // TODO: get all blog post with status "publishing" that are linked to the X-API-KEY in the headers
    return NextResponse.json([])
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error }, { status: 500 })
  }
}

// Webhook subscribe triggers when the user TURN ON a zap that he has created
// url will be sent in the request.body it correspond to the webhook Zapier give us to trigger
// our Zap trigger like "Publish blog post"
// You can find the user access_token in the "Authorization" header of the request
// This will help retrieve the user in the database
export async function POST(request: Request) {
  try {
    const accessToken = getHeaderAccessToken(request.headers.get("Authorization"))
    const body = await request.json();
    console.log("[POST] webhook", { accessToken, body, url: request.url })

    const integration = jwt.verify(accessToken, process.env.NEXT_PUBLIC_ZAPIER_CLIENT_SECRET ?? "");
    console.log(chalk.yellow("integration from token:"), integration)

    if (!integration?.id) {
      throw new Error("[POST] zapier webhook: token invalid, integration id missing")
    }

    if (!integration?.user_id) {
      throw new Error("[POST] zapier webhook: token invalid, user_id missing")
    }

    if (!integration?.project_id) {
      throw new Error("[POST] zapier webhook: token invalid, project_id missing")
    }

    await supabase().from("integrations")
      .update({ enabled: true, metadata: body })
      .eq("id", integration.id)
      .throwOnError()

    return NextResponse.json({
      ...integration,
      enabled: true,
      metadata: body
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error }, { status: 500 })
  }
}

// Webhook unsubscribe triggers when the user TURN OFF or delete a zap
// The integration or url must be deleted
export async function DELETE(request: Request) {
  try {
    const accessToken = getHeaderAccessToken(request.headers.get("Authorization"));
    const body = await request.json();
    console.log("[DELETE] webhook", { accessToken, body, url: request.url });

    const integration = jwt.verify(accessToken, process.env.NEXT_PUBLIC_ZAPIER_CLIENT_SECRET ?? "");
    console.log(chalk.yellow("integration from token:"), integration)

    if (!integration?.id) {
      throw new Error("[POST] zapier webhook: token invalid, integration id missing")
    }

    if (!integration?.user_id) {
      throw new Error("[POST] zapier webhook: token invalid, user_id missing")
    }

    if (!integration?.project_id) {
      throw new Error("[POST] zapier webhook: token invalid, project_id missing")
    }

    await supabase().from("integrations").update({ enabled: false }).eq("id", integration.id).throwOnError();

    return NextResponse.json(body)
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error }, { status: 500 })
  }
}