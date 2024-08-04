import chalk from "chalk";
import { AI } from "../../AI";
import {
  cleanArticle,
  convertMarkdownToHTML,
  deductCredits,
  fetchSitemapXml,
  getAndSaveSchemaMarkup,
  getSitemapUrls,
  getKeywordsForKeywords,
  getProjectContext,
  getProjectKnowledges,
  getRelevantKeywords,
  getRelevantUrls,
  getSavedWritingStyle,
  getYoutubeVideosForKeyword,
  markArticleAsReadyToView,
  setPromptWritingStyle,
  updateBlogPost,
  updateBlogPostStatus,
  getManualWritingStyle,
} from "../../helpers";
import { NextResponse } from "next/server";
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

  const context = getProjectContext({
    name: project.name,
    website: project.website,
    description: project.metatags?.description || project?.description,
    lang: language.label,
  })

  const ai = new AI({ context });

  // ADD H1 TITLE TO THE ARTICLE
  // ai.article = `# ${body.headline}\n`;

  // CHANGE STATUS TO WRITING
  await updateBlogPostStatus(body.articleId, "writing");

  const { keywords: kw } = await getKeywordsForKeywords({
    keyword: body.seed_keyword,
    countryCode: language.code
  });
  const keywords = await getRelevantKeywords({
    query: body.headline,
    keywords: kw,
    userId: body.userId,
    articleId: body.articleId,
    topK: 30
  });
  await updateBlogPost(body.articleId, { keywords })

  // WRITE META DESCRIPTION
  const { description: metaDescription } = await ai.metaDescription({
    ...body,
    title: body.headline,
    keywords
  });

  // FETCH WRITING STYLE IF IT EXISTS
  let writingStyle: any = getManualWritingStyle(body);
  if (body.writing_style_id) {
    writingStyle = await getSavedWritingStyle(body.writing_style_id)
  }

  // FETCH THE SITEMAP
  let sitemaps;
  if (body.sitemap) {
    const sitemapXml = await fetchSitemapXml(body.sitemap);
    console.log(chalk.yellow(sitemapXml));
    sitemaps = getSitemapUrls({ websiteUrl: project.website, sitemapXml });
    sitemaps = await getRelevantUrls({
      query: body.headline,
      urls: sitemaps,
      userId: body.userId,
      articleId: body.articleId,
      topK: 10
    });
  }

  // TODO: add knowledges in the prompt
  const knowledges = await getProjectKnowledges({
    userId: body.userId,
    projectId: body.project_id,
    topK: 8,
    query: body.headline
  })

  let prompt = `Now write up to ${body.word_count} words using this template`;

  setPromptWritingStyle({ prompt, writingStyle });

  prompt += body.with_introduction ? "\n- add an introduction, it is no more than 100 words (it never has sub-sections)" : "\n- do not add an introduction"
  prompt += body.with_conclusion ? "\n- add a conclusion, it is no more than 200 words (it never has sub-sections)" : "\n- do not add a conclusion"
  prompt += body.with_key_takeways ? "\n- add a key takeways, it is a list of key points or short paragraph (it never has sub-sections)" : "\n- do not add a key takeways"
  prompt += body.with_faq ? "\n- add a FAQ" : "\n- do not add a FAQ";
  prompt += `\n- Language: ${language.label}`;

  if (body.additional_information) {
    prompt += `\n${body.additional_information}`;
  }

  // if (body.keywords?.length > 0) {
  //   prompt += `\n- List of keywords to include (avoid keywords stuffing): ${body.keywords}`
  // }

  if (sitemaps?.length > 0) {
    prompt += `\n- Sitemap (include relevant links only, up to 10 links):\n${sitemaps?.join('\n')}\n\n`
  }

  if (keywords?.length > 0) {
    prompt += `\n- Keywords (include relevant keywords only, up to 15 keywords):\n${keywords.join('\n')}\n\n`
  }

  let videos = [];
  if (body.with_youtube_videos) {
    const { videos: youtubeVideos } = await getYoutubeVideosForKeyword({
      keyword: body.headline,
      languageCode: language.code,
      locationCode: language.location_code,
    });
    videos = youtubeVideos;
  }

  if (videos?.length > 0) {
    prompt += `\n- Youtube videos (include relevant video(s) only, up to 1 video per section maximum, don't add a list of video at the end of the article):
    - include relevant video(s) only
    - up to 1 video per section maximum
    - don't add a list of video at the end of the article
    - don't put more than 1 video together
    - here is how you embed it in the markdown => <iframe width="560" height="315" src="https://www.youtube.com/embed/REPLACE_WITH_YOUTUBE_VIDEO_ID" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

    ${JSON.stringify(videos, null, 2)}
    `
  }

  prompt += `\nHeadline structure: ${body.title_structure}`;
  prompt += `\nHeadline: ${body.headline}`;
  prompt += `\nOutline:\n${JSON.stringify(body.outline, null, 2)}`;
  prompt += `\nReplace all variables with their respective value.`;

  prompt += `\n\nWrap your output in \`\`\`markdown\`\`\``

  const articleContent = await ai.ask(prompt, { type: "markdown", mode: "PSEO article", temperature: 0.5 });

  ai.article += `\n\n${articleContent}`

  const cleanedArticle = cleanArticle(ai.article)
  console.log(chalk.yellow(cleanedArticle, null, 2));

  // CONVERT MARKDOWN ARTICLE TO HTML
  const html = convertMarkdownToHTML(cleanedArticle);
  console.log("html", chalk.redBright(cleanedArticle));

  await getAndSaveSchemaMarkup({
    project,
    pendingArticle,
    cleanedArticle,
    lang: language.label,
    structuredSchemas: body.structured_schemas
  })

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
    keywords
  });

  // DEDUCTS CREDITS FROM USER SUBSCRIPTION
  const creditCheck = {
    userId: body.userId,
    costInCredits: 1 + (body.structured_schemas.length * 0.25),
    featureName: "pseo/write"
  }
  await deductCredits(creditCheck);

  return NextResponse.json({
    article: cleanedArticle
  }, { status: 200 });
}