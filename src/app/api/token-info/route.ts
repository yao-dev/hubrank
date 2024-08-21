import { NextRequest, NextResponse } from "next/server";
import { getGoogleClient } from "../search-console-auth-url/route";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const origin = req.nextUrl.origin;
    const oauth2Client = getGoogleClient(origin);

    const tokenInfo = await oauth2Client.getTokenInfo("ya29.a0AcM612xl0AVXjFdsrryRRAZjDaNFNfgxoiUwarUY9qJZavc61Act-TLPHljF52EZj2UXDr4FTgG4Oi7F7C_YNCY5yspjgwFvXOBtdDSH0zCaTIFWKUcjYb5tRbcEQIsxWezzLYkQ8uyR_jeVlLZmsSnEsDnK3CTHBV77b3dOaCgYKAeUSARESFQHGX2Mit82uE9-8nWJZFrQo1Wgt4w0175")

    return NextResponse.json({ data: tokenInfo })
  } catch (e) {
    console.log(e)
    return NextResponse.json({ data: null })
  }
}