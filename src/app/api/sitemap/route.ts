import { NextResponse } from "next/server";
import { fetchSitemapXml, getSitemapUrls } from "../helpers";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sitemapXml = await fetchSitemapXml(body.url);
    const urls = getSitemapUrls({ websiteUrl: body.website_url, sitemapXml, count: 1000 });
    return NextResponse.json({ urls }, { status: 200 })
  } catch (e) {
    console.log(e)
    return NextResponse.json({ message: "Delete knowledge error" }, { status: 500 })
  }
}