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

  let articleId;

  try {
    console.log({
      title: body.title,
      seed_keyword: body.seed_keyword,
      status: "queue",
      keywords: body.keywords,
      user_id: body.userId,
      project_id: body.project_id,
      language_id: body.language_id,
      title_mode: body.title_mode,
      content_type: body.content_type,
      purpose: body.purpose,
      tones: body.tones,
      perspective: body.perspective,
      clickbait: body.clickbait,
      sitemap: body.sitemap,
      external_sources: body.external_sources,
      external_sources_objective: body.external_sources_objective,
      with_featured_image: body.with_featured_image,
      with_table_of_content: body.with_table_of_content,
      with_sections_image: body.with_sections_image,
      with_sections_image_mode: body.with_sections_image_mode,
      image_source: body.image_source,
      with_seo: body.with_seo,
      writing_mode: body.writing_mode,
      writing_style_id: body.writing_style_id,
      additional_information: body.additional_information,
      word_count: body.word_count,
      with_hook: body.with_hook,
      outline: body.outline,
    })
    const { data: queuedArticle } = await supabase.from("blog_posts")
      .insert({
        title: body.title,
        seed_keyword: body.seed_keyword,
        status: "queue",
        keywords: body.keywords,
        user_id: body.userId,
        project_id: body.project_id,
        language_id: body.language_id,
        title_mode: body.title_mode,
        content_type: body.content_type,
        purpose: body.purpose,
        tones: body.tones,
        perspective: body.perspective,
        clickbait: body.clickbait,
        sitemap: body.sitemap,
        external_sources: body.external_sources,
        external_sources_objective: body.external_sources_objective,
        with_featured_image: body.with_featured_image,
        with_table_of_content: body.with_table_of_content,
        with_sections_image: body.with_sections_image,
        with_sections_image_mode: body.with_sections_image_mode,
        image_source: body.image_source,
        with_seo: body.with_seo,
        writing_mode: body.writing_mode,
        writing_style_id: body.writing_style_id,
        additional_information: body.additional_information,
        word_count: body.word_count,
        with_hook: body.with_hook,
        outline: body.outline,
      })
      .select("id")
      .single()
      .throwOnError();

    console.log("queuedArticle", queuedArticle)

    articleId = queuedArticle?.id;

    await supabase
      .from('blog_posts')
      .update({ status: "writing" })
      .eq("id", articleId)
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

      hook = ai.parse(hook, "markdown")

      ai.addArticleContent(hook);
    }

    for (const [index, heading] of Object.entries(body.outline)) {
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

      console.log("SUMMARISE", content)

      let stats = getSummary(content);

      console.log("SUMMARISE DONE", stats)

      if (stats.difficultWords >= 5 || stats.FleschKincaidGrade > 9) {
        console.log("REPHRASE")
        content = await ai.rephrase(content);
        console.log("REPHRASE DONE", content)
      }

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
      .eq("id", articleId)
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