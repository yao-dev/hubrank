import { NextResponse } from "next/server";
import { fetchSitemapXml, getSitemapUrls, processUrlsToMarkdownChunks } from "../../helpers";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const urls = getSitemapUrls({
      websiteUrl: body.website,
      sitemapXml: await fetchSitemapXml(body.sitemap),
      count: 100
    });

    await processUrlsToMarkdownChunks({
      urls,
      projectId: body.projectId,
      userId: body.userId,
    })

    return NextResponse.json({ message: "Url to vector scheduled" }, { status: 200 })
  } catch (e) {
    console.log(e)
    return NextResponse.json({ message: "Url to vector error" }, { status: 500 })
  }
}