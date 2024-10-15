import { NextRequest, NextResponse } from "next/server";
import { createSchedule } from "@/helpers/qstash";
import {
  getProjectContext,
  getUpstashDestination,
  getSavedWritingStyle,
  insertBlogPost,
  getManualWritingStyle, updateBlogPost,
  getErrorMessage,
  getWritingConcurrencyLeft
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
    // const { data: user } = await supabase().from("users").select("*, users_premium:users_premium!user_id(*)").eq("id", body.userId).maybeSingle();
    // user.premium = getUserPremiumData(user);
    // const cost = (body.headlines.length * body.word_count) + (body.headlines.length * (body.structured_schemas.length * 100))

    // if (!user.premium.words || user.premium.words < cost) {
    //   return NextResponse.json({ message: "Insufficient words" }, { status: 401 })
    // }

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

    // Deduct credits from user subscription
    // TODO: update credits, with estimated words count + estimated markup words count
    // await deductCredits({
    //   userId: body.userId,
    //   costInCredits: cost,
    //   featureName: "pseo/write",
    //   premiumName: "words"
    // });

    // Create and schedule blog posts for each headline using Promise.all
    const schedulingPromises = body.headlines.map(async (headline) => {
      let id;
      try {
        // Insert new blog post with queue status
        const newArticle = await insertBlogPost({ ...body, title: headline, cost: 1 + (body.structured_schemas.length * 0.25) });
        id = newArticle?.id;

        const concurrencyLeft = await getWritingConcurrencyLeft();

        if (id && concurrencyLeft > 0) {
          await updateBlogPost(id, {
            metadata: {
              ...body,
              title: headline,
              seed_keyword: headline,
              articleId: id,
              context,
              writingStyle,
              language,
              project,
            }
          })

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

          if (scheduleId) {
            await updateBlogPost(id, { schedule_id: scheduleId });
          }
        }
      } catch (e) {
        console.log(`Failed to schedule blog post for headline: ${headline}`, getErrorMessage(e));
        if (id) {
          // Update blog post status to error if scheduling fails
          await updateBlogPost(id, { status: 'error' });
        }
      }
    });

    await Promise.all(schedulingPromises);

    return NextResponse.json({ scheduled: true }, { status: 200 });
  } catch (e) {
    console.log(e instanceof Error ? e.message : 'An unknown error occurred');
    console.log(getErrorMessage(e))
    return NextResponse.json({ scheduled: false }, { status: 500 });
  }
}