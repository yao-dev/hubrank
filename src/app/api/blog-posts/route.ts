import { NextResponse } from "next/server";
import { updateCredits } from "../helpers";

export const maxDuration = 30;

export async function POST(request: Request) {
  const body = await request.json();

  try {
    switch (body.type) {
      case 'UPDATE': {
        if (body.old_record?.status !== "error" && body.record.status === "error") {
          await updateCredits({ userId: body.record.user_id, credits: Math.max(body.record.cost, 0), action: 'increment' })
        }
        break;
      }
    }

    return NextResponse.json({ message: "Blog post webhook success", body }, { status: 200 })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: "Blog post webhook error", error, body }, { status: 500 })
  }
}