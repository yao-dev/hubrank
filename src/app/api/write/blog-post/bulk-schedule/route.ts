import { NextResponse } from "next/server";
import { createSchedule } from "@/helpers/qstash";
import {
  getProjectContext,
  getUpstashDestination,
  getSavedWritingStyle,
  insertBlogPost,
  getManualWritingStyle,
  deductCredits,
  updateBlogPost,
} from "@/app/api/helpers";
import supabase from "@/helpers/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();

  try {
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

    // DEDUCTS CREDITS FROM USER SUBSCRIPTION
    const cost = body.headlines.length + (body.headlines.length * (body.structured_schemas.length * 0.25));
    const creditCheck = {
      userId: body.userId,
      costInCredits: cost,
      featureName: "pseo/write"
    }
    await deductCredits(creditCheck);

    // CREATE NEW ARTICLE WITH QUEUE STATUS IN BULK
    await Promise.all(
      body.headlines.map((headline, index) => {
        let id: number;

        insertBlogPost({ ...body, title: headline, cost: 1 + (body.structured_schemas.length * 0.25) })
          .then((result) => {
            id = result
            return createSchedule({
              destination: getUpstashDestination("api/write/blog-post"),
              body: {
                ...body,
                title: headline,
                seed_keyword: headline,
                articleId: id,
                context,
                writingStyle,
                language,
                project,
              },
              headers: {
                "Upstash-Delay": `${(index || 0) as number * 1}m`,
              }
            })
          })
          .then()
          .catch((e) => {
            console.log(`Fail to schedule blog post for headline: ${headline}`, e);
            if (id) {
              updateBlogPost(id, { status: 'error' }).then().catch(console.log);
              // await updateCredits({ userId: body.userId, credits: 1 + (body.structured_schemas.length * 0.25), action: 'increment' })
            }
          })
      })
    )

    return NextResponse.json({ scheduled: true }, { status: 200 });
  } catch (e) {
    console.log(e?.message)
    return NextResponse.json({ scheduled: false }, { status: 500 });
  }
}