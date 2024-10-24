import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { getCompetitors } from "@/helpers/seo";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";
import { getPromptDate } from "../helpers";

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
        prompt = `${getPromptDate()}\n\nWrite 3 ${body.headline_type} headlines for each category (guide/how to, questions, listicles, others) for the following topic/keyword: ${body.topic}. values contain the unformatted headlines only`;
        // prompt = `${getPromptDate()}\n\nWrite 1 ${body.headline_type} headlines for each category (guide/how to, questions, listicles, Problem-Solution, Curiosity-Driven, Benefit-Oriented, Command/Action-Oriented, Comparison, Statistics or Numbers, Testimonial or Case Study, Expert Advice, Controversial or Opinionated, Newsjacking, Challenge, Storytelling, Negative Angle, Time-Sensitive, Intriguing Mystery) for the following topic/keyword: ${body.topic}\n\nOutput a JSON object like\ntype Response = {values: string[];} where values contains the unformatted headlines only`
        break;
      case 'hashtags':
        prompt = `${getPromptDate()}\n\nWrite 10 hashtags for the following topic/keyword: ${body.topic}\n\nOutput a JSON object like\ntype Response = {values: string[];} where values contain the hashtags only`;
        break;
      case 'outline':
        prompt = `${getPromptDate()}\n\nWrite 1 outline with ${body.headings} headings for the following topic/keyword: ${body.topic}\n\n-don't add any text before/after the markup\n-don't number the headings\n-sub-headings are optional\n-make the headings bold, not the sub-headings if there is any`
        break;
      case 'meta_description':
        prompt = `${getPromptDate()}\n\nWrite 4 product description of 170 characters max for the following description: ${body.product_description}. values contain the descriptions only`;
        break;
      case 'website_competitors': {
        const competitors = await getCompetitors(body.website_url);
        console.log(competitors)
        return NextResponse.json(competitors, { headers });
      }
    }

    let schema;

    switch (body.name) {
      case 'headlines':
      case 'hashtags':
      case 'meta_description':
        schema = z.object({
          values: z.array(z.string())
        })
        break;
      case 'outline': {
        schema = z.object({
          html: z.string()
        })
        break;
      }
    }

    console.log({ body, prompt });

    const anthropic = createAnthropic({
      // baseURL: "https://anthropic.hconeai.com/",
      apiKey: process.env.ANTHROPIC_API_KEY, // defaults to process.env["ANTHROPIC_API_KEY"]
      // headers: {
      //   "Helicone-Auth": `Bearer ${process.env.HELICONE_AUTH}`,
      // },
    });

    //   metadata: { user_id: ip }
    let content;

    if (body.name === "outline") {
      const { object } = await generateObject({
        output: "object",
        model: anthropic("claude-3-5-sonnet-20240620"),
        maxTokens: 500,
        temperature: 0.7,
        topK: 2,
        prompt,
        schemaName: body.name as string,
        schema: z.object({
          html: z.string().describe("html ul list (no heading tags)")
        })
      });

      content = [object.html]
    } else {
      const { object } = await generateObject({
        output: "array",
        model: anthropic("claude-3-5-sonnet-20240620"),
        maxTokens: 500,
        temperature: 0.7,
        topK: 2,
        prompt,
        schemaName: body.name as string,
        schema: z.string()
      });

      content = object
    }

    console.log(content);
    console.log(JSON.stringify(content, null, 2))

    return NextResponse.json(content, { headers });
  } catch (e) {
    console.log(e)
    return NextResponse.json(e)
  }
}