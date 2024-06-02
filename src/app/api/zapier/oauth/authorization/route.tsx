import { supabaseAdmin } from "@/helpers/supabase";
import { NextResponse } from "next/server";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");

export async function GET(request: Request) {
  try {
    const searchParams = new URLSearchParams(request.url);

    const client_id = searchParams.get("client_id") ?? "";
    const redirect_uri = searchParams.get("redirect_uri") ?? "";
    const response_type = searchParams.get("response_type") ?? "";
    const state = searchParams.get("state") ?? "";

    console.log("zapier authorize", {
      client_id,
      client_secret: process.env.NEXT_PUBLIC_ZAPIER_CLIENT_SECRET ?? "",
      redirect_uri,
      response_type,
      state,
    });

    const redirectUrl = new URL(redirect_uri);

    redirectUrl.searchParams.append("client_id", client_id);
    redirectUrl.searchParams.append("redirect_uri", redirect_uri);
    redirectUrl.searchParams.append("response_type", response_type);
    redirectUrl.searchParams.append("state", state);
    redirectUrl.searchParams.append("client_secret", process.env.NEXT_PUBLIC_ZAPIER_CLIENT_SECRET ?? "");

    console.log("zapier redirectUrl", redirectUrl.href)

    // const { data } = await axios.post("https://433e-2a00-23c7-5c28-e301-1cfe-16e-9a16-27d8.ngrok-free.app/api/zapier/oauth/access-token", {
    //   // client_id: process.env.NEXT_PUBLIC_ZAPIER_CLIENT_ID ?? "",
    //   client_id,
    //   client_secret: process.env.NEXT_PUBLIC_ZAPIER_CLIENT_SECRET ?? "",
    //   redirect_uri,
    //   grant_type: "authorization_code",
    //   code,
    //   state,
    // }, {
    //   headers: {
    //     'content-type': 'application/x-www-form-urlencoded',
    //     'accept': 'application/json'
    //   },
    // })

    return NextResponse.redirect(redirectUrl.href);
  } catch (error) {
    // console.error(error)
    return NextResponse.json({ error }, { status: 500 })
  }
}