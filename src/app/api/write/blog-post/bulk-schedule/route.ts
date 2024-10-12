import { NextRequest, NextResponse } from "next/server";
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

/**
 * POST handler for bulk scheduling of blog posts
 * @param {NextRequest} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response indicating whether scheduling was successful
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();

  try {
    // Fetch project and language data concurrently
    const [
      { data: project },
      { data: language },
    ] = await Promise.all([
      supabase().from("projects").select("*").eq("id", body.project_id).single(),
      supabase().from("languages").select("*").eq("id", body.language_id).single()
    ]);

    // Generate project context
    const context = getProjectContext({
      name: project.name,
      website: project.website,
      description: project.metatags?.description || project?.description,
      lang: language.label,
    })

    // Fetch or generate writing style
    let writingStyle: any = getManualWritingStyle(body);
    if (body.writing_style_id) {
      writingStyle = await getSavedWritingStyle(body.writing_style_id)
    }

    // Calculate total cost for all blog posts
    const cost = body.headlines.length + (body.headlines.length * (body.structured_schemas.length * 0.25));
    const creditCheck = {
      userId: body.userId,
      costInCredits: cost,
      featureName: "pseo/write"
    }
    // Deduct credits from user subscription
    await deductCredits(creditCheck);

    // Create and schedule blog posts for each headline using Promise.all
    const schedulingPromises = body.headlines.map(async (headline) => {
      let id;
      try {
        // Insert new blog post with queue status
        const newArticle = await insertBlogPost({ ...body, title: headline, cost: 1 + (body.structured_schemas.length * 0.25) });
        id = newArticle?.id;

        // Schedule the blog post creation
        const scheduleId = await createSchedule({
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
        });

        if (id && scheduleId) {
          await updateBlogPost(id, { schedule_id: scheduleId });
        }
      } catch (e) {
        console.log(`Failed to schedule blog post for headline: ${headline}`, e);
        if (id) {
          // Update blog post status to error if scheduling fails
          await updateBlogPost(id, { status: 'error' });
          // TODO: Implement credit refund logic
          // await updateCredits({ userId: body.userId, credits: 1 + (body.structured_schemas.length * 0.25), action: 'increment' })
        }
      }
    });

    await Promise.all(schedulingPromises);

    return NextResponse.json({ scheduled: true }, { status: 200 });
  } catch (e) {
    console.log(e instanceof Error ? e.message : 'An unknown error occurred');
    return NextResponse.json({ scheduled: false }, { status: 500 });
  }
}