import { NextResponse } from "next/server";
import { createSchedule } from "@/helpers/qstash";
import { AI } from "@/app/api/AI";
import { getHeadlines, getProjectContext, getUpstashDestination, getWritingStyle, insertBlogPost, updateBlogPost, updateBlogPostStatus } from "@/app/api/helpers";
import { supabaseAdmin } from "@/helpers/supabase";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");

export async function POST(request: Request) {
  const body = await request.json();
  const ai = new AI();

  // CREATE NEW ARTICLE WITH QUEUE STATUS
  const articleId = await insertBlogPost(body)

  // CHANGE STATUS TO WRITING
  await updateBlogPostStatus(articleId, "writing")

  const [
    { data: project },
    { data: language },
  ] = await Promise.all([
    supabase.from("projects").select("*").eq("id", body.project_id).single(),
    supabase.from("languages").select("*").eq("id", body.language_id).single()
  ]);

  const context = getProjectContext({
    name: project.name,
    website: project.website,
    description: project.metatags?.description || project?.description,
    lang: language.label,
  })

  // FETCH WRITING STYLE IF IT EXISTS
  let writingStyle;
  if (body.writing_style_id) {
    writingStyle = await getWritingStyle(body.writing_style_id)
  }

  if (body.title_mode === "custom") {
    body.title = body.custom_title;
  } else {
    const headlines = await getHeadlines({
      language,
      context,
      writingStyle,
      seedKeyword: body.seed_keyword,
      purpose: body.purpose,
      tone: body.tones,
      contentType: body.content_type,
      clickbait: body.clickbait,
      isInspo: body.title_mode === "inspo",
      inspoTitle: body.title_mode === "inspo" && body.inspo_title,
      count: 1
    });

    body.title = headlines?.[0];

    // CHANGE STATUS TO WRITING
    await updateBlogPost(articleId, { title: body.title })
  }

  await createSchedule({
    destination: getUpstashDestination("api/write/blog-post"),
    body: {
      ...body,
      articleId,
      context,
      writingStyle,
      language,
      project
    },
  });

  return NextResponse.json({
    success: true
  }, { status: 200 });
}