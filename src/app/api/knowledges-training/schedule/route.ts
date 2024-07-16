import { NextResponse } from "next/server";
import { createSchedule } from "@/helpers/qstash";
import { getUpstashDestination } from "@/app/api/helpers";

export async function POST(request: Request) {
  const body = await request.json();

  for (let [index, headline] of Object.entries(body.headlines)) {
    await createSchedule({
      destination: getUpstashDestination("api/knowledges-training"),
      body: {},
      headers: {
        "Upstash-Delay": `${(index || 0) as number * 3}s`,
      }
    });
  }

  return NextResponse.json({
    success: true
  }, { status: 200 });
}