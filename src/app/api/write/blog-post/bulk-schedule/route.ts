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
import { supabaseAdmin } from "@/helpers/supabase";
import { getSerp } from "@/helpers/seo";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");

export async function POST(request: Request) {
  const body = await request.json();

  try {
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
      body.headlines.map(async (headline, index) => {
        let id;
        try {
          id = await insertBlogPost({ ...body, title: headline, cost: 1 + (body.structured_schemas.length * 0.25) });
          const competitors = await getSerp({
            query: body.seed_keyword,
            languageCode: language.code,
            locationCode: language.location_code,
          });

          await createSchedule({
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
              competitors
            },
            headers: {
              "Upstash-Delay": `${(index || 0) as number * 1}m`,
            }
          });
        } catch (e) {
          console.log(`Fail to schedule blog post for headline: ${headline}`, e);
          if (id) {
            await updateBlogPost(id, { status: 'error' });
            // await updateCredits({ userId: body.userId, credits: 1 + (body.structured_schemas.length * 0.25), action: 'increment' })
          }
        }
      })
    )

    return NextResponse.json({ scheduled: true }, { status: 200 });
  } catch (e) {
    console.log(e?.message)
    return NextResponse.json({ scheduled: false }, { status: 500 });
  }
}