import { supabaseAdmin } from "@/helpers/supabase";
import { NextResponse } from "next/server";
import { AI } from "../AI";
import { getSummary } from 'readability-cyr';
import { marked } from "marked";

export const maxDuration = 300;

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");

export async function POST(request: Request) {
  const start = performance.now();
  const body = await request.json();

  const articleId = body.article_id;

  try {
    const { data: article } = await supabase.from("blog_posts")
      .update({
        status: "queue",
        retry_count: 1
      })
      .eq("id", articleId)
      .select("*")
      .single()
      .throwOnError();

    if (!article) {
      throw new Error(`Article with id ${articleId} not found`)
    }

    await supabase
      .from('blog_posts')
      .update({ status: "writing" })
      .eq("id", articleId)
      .throwOnError();

    const ai = new AI();
    const outline = article.outline.map((i: any) => i.name).join(', ');
    const wordsCount = await ai.sectionsWordCount({
      outline,
      word_count: article.word_count,
    })

    ai.article = `# ${article.title}\n`;

    if (article.with_hook) {
      let hook = await ai.hook({
        title: article.title,
        outline,
        seed_keyword: article.seed_keyword,
        keywords: article.keywords,
        perspective: article.perspective,
      });

      let stats = getSummary(hook)

      // if (stats.difficultWords >= 5 || stats.FleschKincaidGrade > 9) {
      // if (stats.FleschKincaidGrade > 12) {
      //   hook = await ai.rephrase(hook);
      // }

      hook = ai.parse(hook, "markdown")

      ai.addArticleContent(hook);
    }

    for (const [index, heading] of Object.entries(article.outline) as any) {
      // TODO: heading.media
      // TODO: heading.external_source + heading.instruction
      let content = await ai.write({
        heading_prefix: "##",
        title: article.title,
        heading,
        // word_count: section.sub_sections ? sectionWithSubWordCount : section.word_count,
        word_count: wordsCount[index].word_count,
        outline,
        perspective: article.perspective,
        keywords: wordsCount[index].keywords,
      });

      console.log("SUMMARISE", content)

      let stats = getSummary(content);

      console.log("SUMMARISE DONE", stats)

      // if (stats.difficultWords >= 5 || stats.FleschKincaidGrade > 9) {
      // if (stats.FleschKincaidGrade > 12) {
      //   console.log("REPHRASE")
      //   content = await ai.rephrase(content);
      //   console.log("REPHRASE DONE", content)
      // }

      content = ai.parse(content, "markdown")

      ai.addArticleContent(content);
    }

    console.log("BEFORE", ai.article)

    ai.article = ai.article.replaceAll("```markdown", "").replaceAll("```", "")

    console.log("AFTER", ai.article)

    console.log("parse markdown to html")

    const html = marked.parse(ai.article);

    console.log("parse markdown to html done")

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
        word_count: getSummary(ai.article).words
      })
      .eq("id", article?.id)
      .throwOnError();

    return NextResponse.json({
      markdown: ai.article,
      html,
      writingTimeInSeconds,
      stats: getSummary(ai.article)
    }, { status: 200 })
  } catch (e) {
    await supabase
      .from('blog_posts')
      .update({
        status: 'error',
        error: JSON.stringify(e)
      })
      .eq("id", articleId)
      .throwOnError();

    return NextResponse.json(e, { status: 500 })
  }
}