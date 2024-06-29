import { NextResponse } from "next/server";
import { processUrlsToMarkdownChunks } from "../../helpers";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    await processUrlsToMarkdownChunks({
      website: body.website,
      sitemap: body.sitemap,
      projectId: body.projectId,
      userId: body.userId,
    })

    return NextResponse.json({ message: "Url to vector scheduled" }, { status: 200 })
  } catch (e) {
    console.log(e)
    return NextResponse.json({ message: "Url to vector error" }, { status: 500 })
  }
}