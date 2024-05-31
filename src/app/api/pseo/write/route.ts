import chalk from "chalk";
import { AI } from "../../AI";
import { cleanArticle, convertMarkdownToHTML, getBlogUrls, getWritingStyle, markArticleAsReadyToView, updateBlogPostStatus } from "../../helpers";
import { NextResponse } from "next/server";
import axios from "axios";
import { getSummary } from 'readability-cyr';

export const maxDuration = 120;

export async function POST(request: Request) {
  const body = await request.json();
  const ai = new AI()

  // CHANGE STATUS TO WRITING
  await updateBlogPostStatus(body.articleId, "writing")

  // FETCH THE SITEMAP
  let sitemaps;
  if (body.sitemap) {
    const { data: sitemapXml } = await axios.get(body.sitemap);
    console.log(chalk.yellow(sitemapXml));
    sitemaps = getBlogUrls(sitemapXml)
  }
  // WRITE META DESCRIPTION
  const { description: metaDescription } = await ai.metaDescription(body);

  // FETCH WRITING STYLE IF IT EXISTS
  let writingStyle;
  if (body.writing_style_id) {
    writingStyle = await getWritingStyle(body.writing_style_id)
  }

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
    prompt += `\n- Sitemap (useful to include relevant links):\n${JSON.stringify(sitemaps, null, 2)}`
  }


  prompt += `\nHeadline structure: ${body.title_structure}`;
  prompt += `\nHeadline: ${body.headline}`;
  prompt += `\nOutline:\n${JSON.stringify(body.outline, null, 2)}`;
  prompt += `\nReplace all variables with their respective value.`;

  const article = await ai.ask(prompt, { type: "markdown", mode: "PSEO article", temperature: 0.5 });

  const cleanedArticle = cleanArticle(article)
  console.log(chalk.yellow(cleanedArticle, null, 2));

  // CONVERT MARKDOWN ARTICLE TO HTML
  const html = convertMarkdownToHTML(cleanedArticle);
  console.log("html", chalk.redBright(cleanedArticle));


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