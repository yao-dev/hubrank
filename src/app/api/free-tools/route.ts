import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL ?? "",
  token: process.env.UPSTASH_REDIS_PASSWORD ?? "",
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(5, "1 d"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.ip ?? "127.0.0.1";
    const result = await ratelimit.limit(ip);

    const headers = {
      'X-RateLimit-Limit': `${result.limit}`,
      'X-RateLimit-Remaining': `${result.remaining}`
    }

    if (!result.success) {
      return NextResponse.json({ message: 'You\'ve reached your daily limit.', rateLimitState: result }, { headers })
    }

    // TODO: generate the data

    return NextResponse.json({ data: null }, { headers })
  } catch (e) {
    console.log(e)
    return NextResponse.json(e)
  }
}