import { NextResponse } from "next/server";
import { publishBlogPost, updateCredits } from "../helpers";
import supabase from "@/helpers/supabase/server";

export const maxDuration = 30;

const markAsError = "MARK_AS_ERROR"

export async function POST(request: Request) {
  const body = await request.json();

  try {
    switch (body.type) {
      case 'UPDATE': {
        if (body.old_record?.status !== "error" && body.record.status === "error") {
          await updateCredits({ userId: body.record.user_id, credits: Math.max(body.record.cost, 0), action: 'increment' })
        } else if (body.old_record?.status !== "writing" && body.record.status === "writing") {
          // schedule a job that will run 5min after initial insert
          // it will mark the blog post as error if it has not finished
          // await createSchedule({
          //   destination: getUpstashDestination("api/blog-posts"),
          //   body: {
          //     type: markAsError,
          //     blog_post_id: body.record.id
          //   },
          //   headers: {
          //     "Upstash-Delay": "5m",
          //   }
          // });
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