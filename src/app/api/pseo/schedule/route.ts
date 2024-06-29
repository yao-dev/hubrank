import { NextResponse } from "next/server";
import { createSchedule } from "@/helpers/qstash";
import { getUpstashDestination, insertBlogPost } from "../../helpers";
import { AI } from "../../AI";

export async function POST(request: Request) {
  const body = await request.json();
  const ai = new AI();

  const outline = await ai.getPSeoOutline({
    ...body,
    content_type: body.content_type,
    headline: body.title_structure,
    word_count: body.word_count,
    variables: body.variableSet,
  });

  for (let [index, headline] of Object.entries(body.headlines)) {
    // CREATE NEW ARTICLE WITH QUEUE STATUS
    let articleId = await insertBlogPost({
      ...body,
      title: headline
    })
    await createSchedule({
      destination: getUpstashDestination("api/pseo/write"),
      body: {
        ...body,
        outline,
        title_structure: body.title_structure,
        headline,
        articleId
      },
      headers: {
        "Upstash-Delay": `${(index || 0) as number * 10}s`,
      }
    });
  }

  return NextResponse.json({
    success: true
  }, { status: 200 });
}