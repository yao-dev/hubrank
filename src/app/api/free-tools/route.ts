import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import Anthropic from "@anthropic-ai/sdk";
import dJSON from "dirty-json";
import { models } from "../AI";

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

    if (process.env.NODE_ENV !== "development" && !result.success) {
      return NextResponse.json({ message: 'You\'ve reached your daily limit.', rateLimitState: result }, { headers })
    }

    const body = await req.json();

    let prompt = ""

    switch (body.name) {
      case 'headlines':
        prompt = `Write 3 ${body.headline_type} headlines for each category (guide/how to, questions, listicles, others) for the following topic/keyword: ${body.topic}\n\nOutput a JSON object like\ntype Response = {values: string[];} where values contains the unformatted headlines (string) only`;
        // prompt = `Write 1 ${body.headline_type} headlines for each category (guide/how to, questions, listicles, Problem-Solution, Curiosity-Driven, Benefit-Oriented, Command/Action-Oriented, Comparison, Statistics or Numbers, Testimonial or Case Study, Expert Advice, Controversial or Opinionated, Newsjacking, Challenge, Storytelling, Negative Angle, Time-Sensitive, Intriguing Mystery) for the following topic/keyword: ${body.topic}\n\nOutput a JSON object like\ntype Response = {values: string[];} where values contains the unformatted headlines (string) only`
        break;
      case 'hashtags':
        prompt = `Write 10 hashtags for the following topic/keyword: ${body.topic}\n\nOutput a JSON object like\ntype Response = {values: string[];} where values contains the hashtags (string) only`;
        break;
      case 'outline':
        prompt = `Write 1 outline with ${body.headings} headings for the following topic/keyword: ${body.topic}\n\nOutput a JSON object like\ntype Response = {values: string[];} where values contains the headings (string) only`
        break;
    }

    console.log({ body, prompt })

    const ai = new Anthropic({
      baseURL: "https://anthropic.hconeai.com/",
      apiKey: process.env.ANTHROPIC_API_KEY, // defaults to process.env["ANTHROPIC_API_KEY"]
      defaultHeaders: {
        "Helicone-Auth": `Bearer ${process.env.HELICONE_AUTH}`,
      },
    });

    const completion = await ai.messages.create({
      model: models.sonnet,
      max_tokens: 500,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
      top_k: 2,
      metadata: { user_id: ip }
    });

    const content = completion.content[0].text
    console.log(content)

    return NextResponse.json(dJSON.parse(content).values, { headers })
  } catch (e) {
    console.log(e)
    return NextResponse.json(e)
  }
}