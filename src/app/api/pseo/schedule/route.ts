import { NextResponse } from "next/server";
import chalk from "chalk";
import { createSchedule } from "@/helpers/qstash";
import { insertBlogPost } from "../../helpers";
import { AI } from "../../AI";

export async function POST(request: Request) {
  const body = await request.json();

  // const variables = Object.keys(body).filter((key) => key.startsWith("variables-")).map((key) => {
  //   const variable = key.replace("variables-", "");
  //   return {
  //     description: body[key],
  //     variable,
  //     instruction: `Replace {${variable}} with ${body[key]}`
  //   }
  // })
  const ai = new AI();
  // const pSeoVariablesValue = await ai.getPSeoVariablesValue({
  //   ...body,
  //   variables
  // })
  // console.log(chalk.yellow(JSON.stringify(pSeoVariablesValue, null, 2)));
  const outline = await ai.getPSeoOutline({
    ...body,
    content_type: body.content_type,
    headline: body.title_structure,
    word_count: body.word_count,
    variables: body.variableSet,
  });

  for (let [index, headline] of Object.entries(body.headlines)) {
    // CREATE NEW ARTICLE WITH QUEUE STATUS
    let articleId = await insertBlogPost({
      ...body,
      title: headline
    })
    await createSchedule({
      destination: "https://usehubrank.com/api/pseo/write",
      body: {
        ...body,
        outline,
        title_structure: body.title_structure,
        headline,
        articleId
      },
      headers: {
        "Upstash-Delay": `${index}m`,
      }
    });
  }

  return NextResponse.json({
    success: true
  }, { status: 200 });
}