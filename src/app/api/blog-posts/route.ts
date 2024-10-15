import { NextResponse } from "next/server";
import { getWritingConcurrencyLeft, getUpstashDestination, publishBlogPost, updateBlogPost } from "../helpers";
import supabase from "@/helpers/supabase/server";
import { createSchedule } from "@/helpers/qstash";

export const maxDuration = 30;

const markAsError = "MARK_AS_ERROR";

export async function POST(request: Request) {
  const body = await request.json();

  try {
    switch (body.type) {
      case 'UPDATE': {
        if (
          body.old_record?.status !== "error" && body.record.status === "error" ||
          body.old_record?.status !== "ready_to_view" && body.record.status === "ready_to_view"
        ) {
          const concurrencyLeft = await getWritingConcurrencyLeft()

          if (concurrencyLeft > 0) {
            const { data: blogPosts } = await supabase().from("blog_posts").select("*").neq("id", body.record.id).eq("status", "queue").order("created_at", { ascending: false }).limit(concurrencyLeft).throwOnError();
            const blogPostsWithUpdatedStatus = blogPosts?.map((item) => {
              return {
                ...item,
                status: "writing"
              }
            })
            await supabase().from('blog_posts').upsert(blogPostsWithUpdatedStatus).throwOnError()
          }
        } else if (body.old_record?.status !== "writing" && body.record.status === "writing") {
          const scheduleId = await createSchedule({
            destination: getUpstashDestination("api/write/blog-post"),
            body: body.record.metadata,
          });

          if (scheduleId) {
            await updateBlogPost(body.record.id, { schedule_id: scheduleId })
          }
        } else if (body.old_record?.status !== "publishing" && body.record.status === "publishing") {
          const { data: integrations } = await supabase().from("integrations").select("*").match({ user_id: body.record.user_id, project_id: body.record.project_id, enabled: true });

          const promises = integrations?.map(async (integration) => {
            try {
              return publishBlogPost({ url: integration.metadata.url, blogPost: body.record })
            } catch (e) {
              console.log('[WEBHOOK - blog-posts]: error publishing to zapier', e);
              return null
            }
          });
          if (promises) {
            await Promise.all(promises);
            await supabase().from("blog_posts").update({ status: "published" }).eq("id", body.record.id);
          }
        }
        break;
      }
      case markAsError: {
        await supabase().from("blog_posts").update({ status: "error" }).eq("id", body.blog_post_id).throwOnError()
        break;
      }
    }

    return NextResponse.json({ message: "Blog post webhook success", body }, { status: 200 })
  } catch (error) {
    throw new Error("Blog post webhook error", { cause: { error, body } });
  }
}