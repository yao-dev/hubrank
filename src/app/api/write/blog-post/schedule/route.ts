import { NextResponse } from "next/server";
import { createSchedule, dateToCron } from "@/helpers/qstash";
import { getHeadlines, getProjectContext, getUpstashDestination, getSavedWritingStyle, insertBlogPost, updateBlogPost, updateBlogPostStatus, getManualWritingStyle, deductCredits } from "@/app/api/helpers";
import { getSerp } from "@/helpers/seo";
import supabase from "@/helpers/supabase/server";
import { addSeconds } from "date-fns";

export const maxDuration = 45;

export async function POST(request: Request) {
  const body = await request.json();

  // CREATE NEW ARTICLE WITH QUEUE STATUS
  const cost = 1 + (body.structured_schemas.length * 0.25);
  const newArticle = await insertBlogPost({ ...body, cost });
  const articleId = newArticle?.id

  try {
    // DEDUCTS CREDITS FROM USER SUBSCRIPTION
    const creditCheck = {
      userId: body.userId,
      costInCredits: cost,
      featureName: "write"
    }
    await deductCredits(creditCheck);

    const [
      { data: project },
      { data: language },
    ] = await Promise.all([
      supabase().from("projects").select("*").eq("id", body.project_id).single(),
      supabase().from("languages").select("*").eq("id", body.language_id).single()
    ]);

    const context = getProjectContext({
      name: project.name,
      website: project.website,
      description: project.metatags?.description || project?.description,
      lang: language.label,
    })

    // FETCH WRITING STYLE IF IT EXISTS
    let writingStyle: any = getManualWritingStyle(body);
    if (body.writing_style_id) {
      writingStyle = await getSavedWritingStyle(body.writing_style_id)
    }

    let competitors = [];

    if (body.title_mode === "custom") {
      body.title = body.custom_title;
      await updateBlogPost(articleId, { title: body.title })
    } else {
      competitors = await getSerp({
        query: body.seed_keyword,
        languageCode: language.code,
        locationCode: language.location_code,
        count: 15
      });

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
        count: 10,
        competitorsHeadlines: competitors.map((item) => item.title)
      });

      body.title = headlines?.[0];

      await updateBlogPost(articleId, { title: body.title })
    }

    // date to cron
    const cron = dateToCron(addSeconds(newArticle?.created_at, 45));

    await createSchedule({
      destination: getUpstashDestination("api/write/blog-post"),
      body: {
        ...body,
        articleId,
        context,
        writingStyle,
        language,
        project,
        competitors
      },
      headers: {
        "Upstash-Cron": cron,
      }
    });

    return NextResponse.json({ scheduled: true }, { status: 200 });
  } catch (e) {
    console.log(e)
    // CHANGE STATUS TO ERROR
    await updateBlogPostStatus(articleId, "error");
    return NextResponse.json({ scheduled: false }, { status: 500 });
  }
}