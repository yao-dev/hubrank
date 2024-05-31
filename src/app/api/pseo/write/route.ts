import chalk from "chalk";
import { AI } from "../../AI";
import { cleanArticle, convertMarkdownToHTML, getBlogUrls, getKeywordsForKeywords, getSchemaMarkup, getWritingStyle, getYoutubeVideosForKeyword, markArticleAsReadyToView, saveSchemaMarkups, updateBlogPostStatus } from "../../helpers";
import { NextResponse } from "next/server";
import axios from "axios";
import { getSummary } from 'readability-cyr';
import { supabaseAdmin } from "@/helpers/supabase";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");
export const maxDuration = 180;

export async function POST(request: Request) {
  const body = await request.json();
  const [
    { data: project },
    { data: pendingArticle },
    { data: language },
  ] = await Promise.all([
    supabase.from("projects").select("*").eq("id", body.project_id).maybeSingle(),
    supabase.from("blog_posts").select("*").eq("id", body.articleId).maybeSingle(),
    supabase.from("languages").select("*").eq("id", body.language_id).maybeSingle()
  ]);

  const ai = new AI()

  // CHANGE STATUS TO WRITING
  await updateBlogPostStatus(body.articleId, "writing");

  // FETCH THE SITEMAP
  let sitemaps;
  if (body.sitemap) {
    const { data: sitemapXml } = await axios.get(body.sitemap);
    console.log(chalk.yellow(sitemapXml));
    sitemaps = getBlogUrls(sitemapXml)
  }
  // WRITE META DESCRIPTION
  const { description: metaDescription } = await ai.metaDescription({
    ...body,
    title: body.headline
  });

  // FETCH WRITING STYLE IF IT EXISTS
  let writingStyle;
  if (body.writing_style_id) {
    writingStyle = await getWritingStyle(body.writing_style_id)
  }

  const { keywords } = await getKeywordsForKeywords({
    keyword: body.headline,
    countryCode: language.code
  })

  const { videos } = await getYoutubeVideosForKeyword({
    keyword: `site:youtube:com ${body.headline}`,
    countryCode: language.code,
    locationCode: language.location_code,
  })

  // site:youtube.com lose weight with push ups

  let prompt = `Now write up to ${body.word_count} words using this template`;

  prompt += writingStyle?.purposes?.length > 0 ? `\nPurposes: ${writingStyle?.purposes.join(', ')}` : "";
  prompt += writingStyle?.emotions?.length > 0 ? `\nEmotions: ${writingStyle?.emotions.join(', ')}` : "";
  prompt += writingStyle?.vocabularies?.length > 0 ? `\nVocabularies: ${writingStyle?.vocabularies.join(', ')}` : "";
  prompt += writingStyle?.sentence_structures?.length > 0 ? `\nSentence structures: ${writingStyle?.sentence_structures.join(', ')}` : "";
  prompt += writingStyle?.perspectives?.length > 0 ? `\nPerspectives: ${writingStyle?.perspectives.join(', ')}` : "";
  prompt += writingStyle?.writing_structures?.length > 0 ? `\nWriting_structures: ${writingStyle?.writing_structures.join(', ')}` : "";
  prompt += writingStyle?.instructional_elements?.length > 0 ? `\nInstructional elements: ${writingStyle?.instructional_elements.join(', ')}` : "";

  prompt += body.with_introduction ? "\n- add an introduction, it is no more than 100 words (it never has sub-sections)" : "\n- do not add an introduction"
  prompt += body.with_conclusion ? "\n- add a conclusion, it is no more than 200 words (it never has sub-sections)" : "\n- do not add a conclusion"
  prompt += body.with_key_takeways ? "\n- add a key takeways, it is a list of key points or short paragraph (it never has sub-sections)" : "\n- do not add a key takeways"
  prompt += body.with_faq ? "\n- add a FAQ" : "\n- do not add a FAQ";
  prompt += `\n- Language: ${body.language}`;

  if (body.additional_information) {
    prompt += `\n${body.additional_information}`;
  }

  // if (body.keywords?.length > 0) {
  //   prompt += `\n- List of keywords to include (avoid keywords stuffing): ${body.keywords}`
  // }

  if (sitemaps?.length > 0) {
    prompt += `\n- Sitemap (include relevant links only, up to 10 links):\n${JSON.stringify(sitemaps, null, 2)}\n`
  }

  if (keywords?.length > 0) {
    prompt += `\n- Keywords (include relevant keywords only, up to 15 keywords):\n${JSON.stringify(keywords, null, 2)}\n`
  }

  if (videos?.length > 0) {
    prompt += `\n- Videos (include relevant video(s) only, up to 1 video per section maximum):\n${JSON.stringify(videos, null, 2)}\n`
  }

  prompt += `\nHeadline structure: ${body.title_structure}`;
  prompt += `\nHeadline: ${body.headline}`;
  prompt += `\nOutline:\n${JSON.stringify(body.outline, null, 2)}`;
  prompt += `\nReplace all variables with their respective value.`;

  prompt += `\n\nWrap your output in \`\`\`markdown\`\`\``

  const article = await ai.ask(prompt, { type: "markdown", mode: "PSEO article", temperature: 0.5 });

  const cleanedArticle = cleanArticle(article)
  console.log(chalk.yellow(cleanedArticle, null, 2));

  // CONVERT MARKDOWN ARTICLE TO HTML
  const html = convertMarkdownToHTML(cleanedArticle);
  console.log("html", chalk.redBright(cleanedArticle));

  const schemas = pendingArticle.schema_markups ?? [];

  for (let schema of body.structured_schemas) {
    const createdSchema = await getSchemaMarkup({
      project,
      article: pendingArticle,
      lang: language.label,
      schemaName: schema,
    })
    schemas.push(createdSchema)
    console.log("schemas", schemas)
    await saveSchemaMarkups(pendingArticle.id, schemas);
  }

  // GET ARTICLE STATS
  const articleStats = getSummary(cleanedArticle);
  // UPDATE ARTICLE STATUS TO READY TO VIEW
  await markArticleAsReadyToView({
    markdown: cleanedArticle,
    // cost: ai.cost,
    html,
    // writingTimeInSeconds,
    articleId: body.articleId,
    wordCount: articleStats.words,
    // featuredImage: body.featuredImage?.href ?? "",
    metaDescription,
  });
  return NextResponse.json({
    article: cleanedArticle
  }, { status: 200 });
}