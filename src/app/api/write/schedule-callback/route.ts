import { deleteSchedule } from "@/helpers/qstash";
import supabase from "@/helpers/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();

    // Decode the base64 encoded sourceBody
    const blogPost = JSON.parse(atob(body.sourceBody));

    // Fetch the schedule_id for the blog post from the database
    const { data } = await supabase()
      .from("blog_posts")
      .select("schedule_id")
      .eq("id", blogPost.id)
      .maybeSingle()
      .throwOnError();

    // Delete the schedule using the retrieved schedule_id
    if (data?.schedule_id) {
      await deleteSchedule(data.schedule_id);
    }

    // Return the original body as a response
    return NextResponse.json(body);
  } catch (e) {
    // Log any errors that occur during the process
    console.error("Error in schedule callback:", e);

    // Return an error response
    return NextResponse.json({ error: true }, { status: 500 });
  }
}