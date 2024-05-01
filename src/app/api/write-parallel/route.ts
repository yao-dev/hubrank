import { supabaseAdmin } from "@/helpers/supabase";
import { NextResponse } from "next/server";
import { AI } from "../AI";
import { getSummary } from 'readability-cyr';
import { marked } from "marked";

export const maxDuration = 300;

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function executeAsyncFunctionsInParallel(asyncArray: Array<Promise<any>>) {
  const promises = [];
  const delays = [...Array(asyncArray.length).keys()]

  for (let i = 0; i <= asyncArray.length - 1; i++) {
    await delay(delays[i] * 5000);
    promises.push(asyncArray[i]);
  }

  return Promise.all(promises);
}

export async function POST(request: Request) {
  const start = performance.now();
  const body = await request.json();

  try {
    const { data: queuedArticle } = await supabase.from("blog_posts")
      .insert({
        // ...body,
        title: body.title,
        seed_keyword: body.seed_keyword,
        status: "queue",
        keywords: body.keywords,
        user_id: body.userId,
        project_id: body.project_id,
        language_id: body.language_id,
      })
      .select("id")
      .single()
      .throwOnError();

    const ai = new AI();
    const wordsCount = await ai.sectionsWordCount(body)
    const outline = body.outline.join(', ');

    ai.article = `# ${body.title}\n`;

    if (body.with_hook) {
      let hook = await ai.hook({
        title: body.title,
        outline,
        seed_keyword: body.seed_keyword,
        keywords: body.keywords,
        perspective: body.perspective,
      });

      let stats = getSummary(hook)

      if (stats.difficultWords >= 5 || stats.FleschKincaidGrade > 9) {
        hook = await ai.rephrase(hook);
      }

      ai.addArticleContent(hook);
    }

    const promptExecutionList = [];
    const sectionContentByIndex: any = {}

    for (const [index, heading] of Object.entries(body.outline)) {
      promptExecutionList.push(
        (async () => {
          let content = await ai.write({
            heading_prefix: "##",
            title: body.title,
            heading,
            // word_count: section.sub_sections ? sectionWithSubWordCount : section.word_count,
            word_count: wordsCount[index].word_count,
            outline,
            perspective: body.perspective,
            keywords: wordsCount[index].word_count,
          });

          let stats = getSummary(content)

          if (stats.difficultWords >= 5 || stats.FleschKincaidGrade > 9) {
            content = await ai.rephrase(content);
          }

          sectionContentByIndex[index] = content.replaceAll("```markdown", "").replaceAll("```", "")

          return sectionContentByIndex[index]
          // ai.addArticleContent(content);
        })()
      )
    }

    // const sectionsContentList = await executeAsyncFunctionsInParallel(promptExecutionList)
    await executeAsyncFunctionsInParallel(promptExecutionList)

    Object.values(sectionContentByIndex).forEach((c) => {
      ai.addArticleContent(c);
    });

    ai.article = ai.article.replaceAll("```markdown", "").replaceAll("```", "")

    console.log(ai.article)

    const html = marked.parse(ai.article);

    const end = performance.now();
    const writingTimeInSeconds = (end - start) / 1000;
    console.log("writing time in seconds", writingTimeInSeconds)

    await supabase
      .from('blog_posts')
      .update({
        markdown: ai.article,
        html,
        status: 'ready_to_view',
        // meta_description: result?.meta_description,
        writing_time_sec: writingTimeInSeconds,
        words_count: getSummary(ai.article).words
      })
      .eq("id", queuedArticle?.id)
      .throwOnError();

    return NextResponse.json({
      markdown: ai.article,
      writingTimeInSeconds,
      stats: getSummary(ai.article)
    }, { status: 200 })
  } catch (e) {
    return NextResponse.json(e, { status: 500 })
  }
}