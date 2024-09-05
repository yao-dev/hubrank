import { NextResponse } from "next/server";
import { getUpstashDestination, updateCredits } from "../helpers";
import { createSchedule } from "@/helpers/qstash";
import { supabaseAdmin } from "@/helpers/supabase";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");
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
          // schedule a job that will run 1 to 2min insertion
          // it will mark the blog post as error if it has not finished
          await createSchedule({
            destination: getUpstashDestination("api/blog-posts"),
            body: {
              type: markAsError,
              blog_post_id: body.record.id
            },
            headers: {
              "Upstash-Delay": "2m",
            }
          });
        }
        break;
      }
      case markAsError: {
        await supabase.from("blog_posts").update({ status: "error" }).eq("id", body.blog_post_id).throwOnError()
        break;
      }
    }

    return NextResponse.json({ message: "Blog post webhook success", body }, { status: 200 })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: "Blog post webhook error", error, body }, { status: 500 })
  }
}