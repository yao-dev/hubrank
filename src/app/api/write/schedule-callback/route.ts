import { deleteSchedule } from "@/helpers/qstash";
import { NextRequest, NextResponse } from "next/server";
import { updateBlogPost } from "../../helpers";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();

    const url = new URL(request.url);
    const status = url.searchParams.get("status");

    if (status === "error") {
      console.log("[Upstash callback error]", {
        ...body,
        body: atob(body.body)
      })
    }

    const msgId = body.sourceMessageId;

    // Delete the schedule using the retrieved schedule_id
    if (msgId) {
      console.log("[Upstash callback] Delete message id:", msgId)
      await deleteSchedule(msgId);
    }

    // Decode the base64 encoded sourceBody
    const blogPost = JSON.parse(atob(body.sourceBody));

    if (blogPost?.id) {
      await updateBlogPost(blogPost.id, { status: "error" })
    }

    // Return the original body as a response
    return NextResponse.json(blogPost);
  } catch (e) {
    // Log any errors that occur during the process
    console.error("Error in schedule callback:", e);

    // Return an error response
    return NextResponse.json({ error: true }, { status: 500 });
  }
}