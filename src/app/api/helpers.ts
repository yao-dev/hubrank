import chalk from "chalk";
import { marked } from "marked";
import { generateUuid5 } from 'weaviate-ts-client';
import { AI } from "./AI";
import axios from "axios";
import { get, isEmpty, isNaN, orderBy, shuffle } from "lodash";
import { Index } from "@upstash/vector";
import { NodeHtmlMarkdown } from "node-html-markdown";
import * as cheerio from "cheerio";
import { TokenTextSplitter } from "langchain/text_splitter";
import { createBackgroundJob } from "@/helpers/qstash";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { getSerp } from "@/helpers/seo";
import supabase from "@/helpers/supabase/server";
import { getSummary } from 'readability-cyr';
import { embed } from "ai";
import { createOpenAI, openai } from "@ai-sdk/openai";
import { avoidWords, emotions, instructionalElements, perspectives, purposes, sentenceStructures, tones, vocabularies, writingStructures } from "@/options";
import { z } from "zod";
import { format } from "date-fns";
import { getCaptions } from '@dofy/youtube-caption-fox';
import { transcribe } from "yt-transcribe";
import { getTocMarkdownText } from "markdown-table-of-content";

export const upstashVectorIndex = new Index({
  url: process.env.UPSTASH_VECTOR_URL || "",
  token: process.env.UPSTASH_VECTOR_TOKEN || "",
})

export const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export const getGroqModel = () => {
  return shuffle([
    // "llama3-8b-8192",
    "llama3-70b-8192",
    "llama3-groq-70b-8192-tool-use-preview",
    "llama3-groq-8b-8192-tool-use-preview"
  ])[0]
}

export const getErrorMessage = (error: any) => {
  return error?.response?.message || error?.message || error
}

export const saveWritingCost = async ({ articleId, cost }: any) => {
  try {
    await supabase().from('blog_posts').update({ cost }).eq("id", articleId).throwOnError();
  } catch (error) {
    console.error(chalk.bgRed("[ERROR]: updating cost"), getErrorMessage(error));
    throw error;
  }
}

export const insertBlogPost = async (data: any) => {
  try {
    const { data: queuedArticle } = await supabase().from("blog_posts")
      .insert({
        title: data.title_mode === "custom" ? data.custom_title : data.title,
        seed_keyword: data.seed_keyword,
        status: "queue",
        keywords: data.keywords,
        user_id: data.userId,
        project_id: data.project_id,
        language_id: data.language_id,
        title_mode: data.title_mode,
        content_type: data.content_type,
        purpose: data.purpose,
        tones: data.tones,
        perspective: data.perspective,
        clickbait: data.clickbait,
        sitemap: data.sitemap,
        external_sources: data.external_sources,
        external_sources_objective: data.external_sources_objective,
        with_featured_image: data.with_featured_image,
        with_table_of_content: data.with_table_of_content,
        with_sections_image: data.with_sections_image,
        with_sections_image_mode: data.with_sections_image_mode,
        image_source: data.image_source,
        with_seo: data.with_seo,
        writing_mode: data.writing_mode,
        writing_style_id: data.writing_style_id,
        additional_information: data.additional_information,
        word_count: data.word_count,
        with_hook: data.with_hook,
        with_introduction: data.with_introduction,
        with_conclusion: data.with_conclusion,
        with_faq: data.with_faq,
        with_key_takeways: data.with_key_takeways,
        outline: data.outline,
        cost: data.cost,
        integration_id: data.integration_id,
        metadata: data.metadata,
      })
      .select("id, created_at")
      .single()
      .throwOnError();
    console.log(chalk.bgBlue("[INFO]: queuedArticle"), queuedArticle);
    return queuedArticle;
  } catch (error) {
    console.error(chalk.bgRed("[ERROR]: inserting blog post"), getErrorMessage(error));
    throw error;
  }
}

export const updateBlogPostStatus = async (articleId: number, status: string) => {
  try {
    await supabase()
      .from('blog_posts')
      .update({ status })
      .eq("id", articleId)
      .throwOnError();
  } catch (error) {
    console.error(chalk.bgRed("[ERROR]: updating blog post status"), getErrorMessage(error));
    throw error;
  }
}

export const updateBlogPost = async (articleId: number, updates: any) => {
  try {
    await supabase()
      .from('blog_posts')
      .update(updates)
      .eq("id", articleId)
      .throwOnError();
  } catch (error) {
    console.error(chalk.bgRed("[ERROR]: updating blog post"), getErrorMessage(error));
    throw error;
  }
}

export const getManualWritingStyle = (body: any) => {
  return {
    tones: body.tones,
    purposes: body.purposes,
    emotions: body.emotions,
    vocabularies: body.vocabularies,
    sentence_structures: body.sentence_structures,
    perspectives: body.perspectives,
    writing_structures: body.writing_structures,
    instructional_elements: body.instructional_elements,
  };
}

export const getSavedWritingStyle = async (writingStyleId?: number) => {
  let writingStyle;
  if (writingStyleId) {
    try {
      const { data } = await supabase().from("writing_styles").select().eq("id", writingStyleId).limit(1).single();
      writingStyle = data;
    } catch (error) {
      console.error(chalk.bgRed("[Error]: fetching writing style"), getErrorMessage(error));
      throw error;
    }
  }
  return writingStyle;
}

export const setPromptWritingStyle = ({ prompt, writingStyle }: any) => {
  prompt += writingStyle?.tones?.length > 0 ? `\nTones: ${writingStyle?.tones.join(', ')}` : "";
  prompt += writingStyle?.purposes?.length > 0 ? `\nPurposes: ${writingStyle?.purposes.join(', ')}` : "";
  prompt += writingStyle?.emotions?.length > 0 ? `\nEmotions: ${writingStyle?.emotions.join(', ')}` : "";
  prompt += writingStyle?.vocabularies?.length > 0 ? `\nVocabularies: ${writingStyle?.vocabularies.join(', ')}` : "";
  prompt += writingStyle?.sentence_structures?.length > 0 ? `\nSentence structures: ${writingStyle?.sentence_structures.join(', ')}` : "";
  prompt += writingStyle?.perspectives?.length > 0 ? `\nPerspectives: ${writingStyle?.perspectives.join(', ')}` : "";
  prompt += writingStyle?.writing_structures?.length > 0 ? `\nWriting_structures: ${writingStyle?.writing_structures.join(', ')}` : "";
  prompt += writingStyle?.instructional_elements?.length > 0 ? `\nInstructional elements: ${writingStyle?.instructional_elements.join(', ')}` : "";
}

export const writeHook = async ({
  ai,
  title,
  outline,
  seed_keyword,
  keywords,
}: any) => {
  console.log(`[start]: hook`);
  try {
    let hook = await ai.hook({
      title,
      outline,
      seed_keyword,
      keywords,
    });

    // await saveWritingCost({ articleId: article_id, cost: ai.cost });
    // const rephraseInstruction = getRephraseInstruction(hook)

    // let stats = getSummary(hook);
    // if (stats.FleschKincaidGrade > 120) {
    //   console.log("- rephrase");
    //   hook = await ai.rephrase(hook, rephraseInstruction);
    //   console.log("- rephrase done");
    // }
    console.log("- add hook to article");
    // ai.addArticleContent(ai.parse(hook, "markdown"));
    ai.addArticleContent(hook);
  } catch (error) {
    console.error(chalk.bgRed("[Error]: generating hook"), getErrorMessage(error));
    throw error;
  }
  console.log(`[end]: hook`);
}

export const getRephraseInstruction = (content: string) => {
  const veryHardSentences = getHemingwayStats(content).filter(i => i.level === "very_hard").map(i => i.text);
  const sentencesToRephrase = shuffle(veryHardSentences).slice(0, Math.max(1, Math.max(veryHardSentences.length, 4)))

  return [
    `Content:\n${content}
    `,
    `Sentences to improve: ${JSON.stringify(sentencesToRephrase, null, 2)}`,
    JSON.stringify(sentencesToRephrase, null, 2),
    "\n===\n",
    "diversify vocabulary",
    "remove adverbs",
    "remove compound adverbs",
    "reduce keywords stuffing",
    "use active voice, idioms and phrasal verbs",
    "add space to your content with paragraphs",
    "edit like a human.",
    // `list of words to absolutely avoid or use alternatives:\n${avoidWords.join('\n- ')}`,
    "keep all links and images if there are any.",
    "if there is any links introduce them naturally by guiding the user towards it without directly stating",
    "Don't end the section like a conclusion, unless it's the conclusion section, but transition smoothly to the next point. This keeps the flow going without making it sound like a conclusion.",
    "Output the update content in markdown",
  ].join('\n')
}

export const writeSection = async ({
  ai,
  index,
  section,
  title,
  outline,
}: {
  ai: any;
  index: number;
  title: string;
  outline: string;
  section: {
    prefix: string;
    keywords: string;
    word_count: number;
    name: string;
    call_to_action?: string;
    call_to_action_example?: string;
    custom_prompt?: string;
    image?: {
      href: string;
      alt: string;
    },
    internal_links?: string[];
    images?: string[];
    video_url?: string;
    tones?: string[];
    purposes?: string[];
    emotions?: string[];
    vocabularies?: string[];
    sentence_structures?: string[];
    perspectives?: string[];
    writing_structures?: string[];
    instructional_elements?: string[];
  };
}) => {
  console.log(`[start]: ${index}) ${section.name}`);
  try {
    let content = await ai.write({
      title,
      section,
      outline,
    });

    if (section?.image?.alt && section?.image?.href) {
      // console.log("image replace", `<img src="${section.image.href}" alt="${section.image.alt}" width="600" height="auto" />`)
      content = content.replace('@@image@@', `<img src="${section.image.href}" alt="${section.image.alt}" width="600" height="auto" />`)
    }
    content = content.replaceAll("https://www.youtube.com/watch?v=", "https://www.youtube.com/embed/")

    const rephraseInstruction = getRephraseInstruction(content)

    let stats = getSummary(content);
    if (stats.FleschKincaidGrade > 12) {
      console.log("- rephrase");
      content = await ai.rephrase(content, rephraseInstruction);
      console.log("- rephrase done");
    }
    console.log("- add section to article", content);
    // ai.addArticleContent(ai.parse(content, "markdown"));
    ai.addArticleContent(content);
  } catch (error) {
    console.error(chalk.bgRed(`[ERROR] generating section ${index}:`), getErrorMessage(error));
    throw error;
  }
  console.log(`[end]: ${index}) ${section.name}`);
}

export const cleanArticle = (article: string) => {
  return article.replaceAll("```markdown", "").replaceAll("```", "");
}

export const removeMarkdownWrapper = (article: string) => {
  return article.replaceAll("```markdown", "").replaceAll("```", "");
}

export const convertMarkdownToHTML = (markdown: string) => {
  console.log("parse markdown to html");
  const html = marked.parse(markdown);
  console.log("parse markdown to html done");
  return html
}

export const markArticleAs = async ({
  markdown,
  html,
  writingTimeInSeconds,
  articleId,
  wordCount,
  metaDescription,
  featuredImage,
  status
}: any) => {
  try {
    console.log(chalk.yellow(JSON.stringify({
      markdown,
      html,
      status,
      writing_time_sec: writingTimeInSeconds,
      word_count: wordCount,
      featured_image: featuredImage,
      meta_description: metaDescription
    }, null, 2)));

    const $ = cheerio.load(html);
    const ogImageUrl = $('img').first().attr('src') ?? "";

    await supabase()
      .from('blog_posts')
      .update({
        markdown,
        html,
        status,
        writing_time_sec: writingTimeInSeconds,
        word_count: wordCount,
        featured_image: featuredImage || ogImageUrl,
        meta_description: metaDescription,
        og_image_url: ogImageUrl,
      })
      .eq("id", articleId)
      .throwOnError();
    console.log("writing time in seconds", writingTimeInSeconds);
    console.log(chalk.green("Success!"))
  } catch (error) {
    console.error(chalk.bgRed("[ERROR] updating blog post:", JSON.stringify(error, null, 2)));
    throw error;
  }
}

export const markArticleAsFailure = async ({ articleId, error }: any) => {
  console.error(chalk.bgRed("[ERROR]: mark article as failure"), error);
  try {
    await supabase()
      .from('blog_posts')
      .update({
        status: 'error',
        error: JSON.stringify(error),
      })
      .eq("id", articleId)
      .throwOnError();
  } catch (updateError) {
    console.error(chalk.bgRed("[ERROR]: updating blog post status to 'error'"), getErrorMessage(updateError));
  }
}

export const getProjectContext = (values: any) => {
  return [
    `Project name: ${values.name || "N/A"}`,
    `Website: ${values.website || "N/A"}`,
    `Description: ${values.description || "N/A"}`,
    `Language: ${values.lang || "English (us)"}`
  ].join('\n')
}

export const normalizePrompt = (prompt: string) => {
  return `${prompt}\n(don't add any text before and after the markdown except the text I request you to write)`
  // .replaceAll("\t", "")
  // .trim()
  // .replaceAll("\n\n\n\n", "\n")
  // .replaceAll("\n\n\n", "\n")
  // .replaceAll("\n\n", "\n")
}

export const fetchSitemapXml = async (sitemapUrl: string): Promise<string> => {
  const { data: sitemapXml } = await axios.get(sitemapUrl);
  return sitemapXml
}

export const getSitemapUrls = ({ websiteUrl, sitemapXml, count = 500 }: { websiteUrl: string, sitemapXml: string; count?: number }): string[] => {
  const $ = cheerio.load(sitemapXml);
  const list = new Set();

  // Extract URLs from <loc> tags
  $('loc').each((_, element) => {
    list.add($(element).text().trim());
  });

  // Extract URLs from href attributes
  $('a').each((_, element) => {
    const href = $(element).attr('href');
    if (href) {
      list.add(href);
    }
  });

  const urls = Array.from(list) as string[];

  return urls.slice(0, count).filter((url) => url.startsWith(websiteUrl))
}

export const getProjectNamespaceId = ({ userId, projectId }: { userId: string; projectId: number }) => {
  const namespaceId = `${userId}-project-${projectId}`;
  return namespaceId;
}

export const getArticleNamespaceId = ({ userId, articleId }: { userId: string; articleId: number }) => {
  const namespaceId = `${userId}-article-${articleId}`;
  return namespaceId;
}

export const getEmbedding = async (input: string): Promise<number[]> => {
  const { embedding, usage } = await embed({
    // https://sdk.vercel.ai/docs/ai-sdk-core/embeddings#embedding-providers--models
    // model needs to have 1536 dimensions to work
    model: openai.embedding('text-embedding-3-small'),
    value: input,
  });
  // const { data } = await axios.post('https://api.voyageai.com/v1/embeddings', {
  //   input,
  //   model: "voyage-lite-02-instruct",
  //   input_type: "document",
  //   truncation: true,
  // }, {
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${process.env.VOYAGE_AI_API_KEY ?? ""}`
  //   }
  // });

  // const embeddings = data?.[0]?.embedding ?? [];

  if (!embedding?.length) {
    throw new Error('Empty embedding')
  }

  return embedding;
}

export const getRelevantUrls = async ({
  query,
  urls,
  userId,
  articleId,
  topK = 20
}: {
  urls: string[];
  query: string;
  userId: string;
  articleId: number;
  topK?: number
}): Promise<string[]> => {
  console.log("urls", urls)
  const namespaceId = getArticleNamespaceId({ userId, articleId });
  const namespace = upstashVectorIndex.namespace(namespaceId);
  const uniqUrls = new Set(urls);
  console.log("uniq urls", uniqUrls)
  const urlSubsets = Array.from(uniqUrls).slice(0, 1000);
  const promises = urlSubsets.map(async (url) => {
    try {
      const embeddings = await getEmbedding(url);
      return namespace.upsert({
        id: url,
        vector: embeddings,
        metadata: {
          article_id: articleId,
          url
        },
      });
    } catch (error) {
      console.error(`Failed to get embeddings for URL: ${url}`, getErrorMessage(error));
      // Handle the error according to your needs, e.g., return null or a default value
      return null;
    }
  });

  await Promise.all(promises)

  console.log("query", query)

  const result = await namespace.query({
    vector: await getEmbedding(query),
    topK: 500,
    includeMetadata: true,
    // includeData: true
  });

  await upstashVectorIndex.deleteNamespace(namespaceId);

  console.log("retrieved urls", result)

  return orderBy(result.filter((item) => item.score >= 0.85), ['score'], ['desc']).slice(0, topK).map(item => item.data) as string[];
}

export const getRelevantKeywords = async ({
  keywords,
  userId,
  articleId,
  query,
  topK = 20
}: {
  keywords: string[];
  userId: string;
  articleId: number;
  query: string;
  topK?: number
}) => {
  const namespaceId = `${userId}-article-${articleId}-keywords`;
  const namespace = upstashVectorIndex.namespace(namespaceId);
  const uniqs = new Set(keywords);
  const subset = Array.from(uniqs).slice(0, 1000);
  const promises = subset.map(async (keyword) => {
    try {
      const embeddings = await getEmbedding(keyword)
      return namespace.upsert({
        id: keyword,
        vector: embeddings,
        metadata: {
          article_id: articleId,
          keyword
        },
      })
    } catch (error) {
      console.error(`Failed to get embeddings for keyword: ${keyword}`, getErrorMessage(error));
      // Handle the error according to your needs, e.g., return null or a default value
      return null;
    }
  });

  await Promise.all(promises);

  const result = await namespace.query({
    vector: await getEmbedding(query),
    topK: 500,
    includeData: true
  });

  await upstashVectorIndex.deleteNamespace(namespaceId);

  return orderBy(result.filter((item) => item.score >= 0.85), ['score'], ['desc']).slice(0, topK).map(item => item.data) as string[];
}

export const getProjectById = async (projectId: number) => {
  return supabase().from("projects").select("*").eq("id", projectId).maybeSingle()
}

export const saveSchemaMarkups = async (postId: number, schemaMarkups: any) => {
  return supabase().from("blog_posts").update({ schema_markups: schemaMarkups }).eq("id", postId);
}

export const getSchemaMarkup = async ({
  project,
  article,
  schemaName,
  lang,
}: any) => {
  const context = getProjectContext({
    name: project.name,
    website: project.website,
    description: project.metatags?.description || project?.description,
    lang,
  })

  const ai = new AI({ context });
  const createdSchema = await ai.schemaMarkup({
    project,
    article: article.text,
    schemaName: schemaName,
    metaDescription: article.meta_description
  });

  console.log("createdSchema", createdSchema)
  return createdSchema
}

export const getUrlOutline = async (url: string) => {
  const { data } = await axios({
    method: "POST",
    url: 'https://api.dataforseo.com/v3/on_page/instant_pages',
    data: [{
      url,
      check_spell: false,
      disable_cookie_popup: false,
      return_despite_timeout: false,
      load_resources: false,
      enable_javascript: false,
      enable_browser_rendering: false
    }],
    auth: {
      username: process.env.DATAFORSEO_USERNAME || "",
      password: process.env.DATAFORSEO_PASSWORD || ""
    },
    headers: {
      "Content-Type": "application/json"
    }
  });

  return data?.tasks?.[0]?.result?.[0]?.items?.[0]?.meta?.htags?.h2 ?? []
}

export const getYoutubeVideosForKeyword = async ({
  keyword,
  languageCode,
  locationCode,
}: any) => {
  const items = await getSerp({
    query: `site:youtube.com ${keyword}`,
    languageCode,
    locationCode,
  });

  console.log("youtube video for keyword", `site:youtube.com ${keyword}`)
  console.log("items", items)

  return {
    videos: items.filter(i => {
      return i.url.startsWith('https://www.youtube.com/watch?v=')
    }).map((i) => ({
      title: i.title,
      url: i.url,
      description: i.description,
      breadcrumb: i.breadcrumb,
      website_name: i.website_name,
    })),
  }
}

export const getHeadlines = async ({
  language,
  context,
  writingStyle,
  seedKeyword,
  purpose,
  tone,
  contentType,
  clickbait,
  isInspo,
  inspoTitle,
  count,
  competitorsHeadlines
}: any) => {
  // if (!language) {
  //   throw new Error("language not found")
  // }

  // const { data: serpDataForSeedKeyword } = await getSerpData({ keyword: seedKeyword, depth: 20, lang: language.code, location_code: language.location_code });

  // if (serpDataForSeedKeyword?.tasks_error > 0 || !serpDataForSeedKeyword) {
  //   throw new Error("error fetching competitors ranking for main keyword")
  // }

  // const competitorsHeadlines = serpDataForSeedKeyword?.tasks[0].result
  //   .map((item: any) => {
  //     return item?.items
  //       .filter((subItem: any) => subItem.type === "organic")
  //       .map((subItem: any) => {
  //         return subItem.title
  //       })
  //   })
  //   .flat(Infinity);

  const ai = new AI({ context });
  const response = await ai.headlines({
    competitorsHeadlines,
    seedKeyword,
    purpose,
    tone,
    contentType,
    clickbait,
    writingStyle,
    isInspo,
    inspoTitle,
    count,
  });

  const headlines = shuffle(response)
  return headlines
}

export const getAndSaveSchemaMarkup = async ({
  project,
  articleId,
  article,
  lang,
  structuredSchemas,
}: any) => {
  const schemas = [];

  for (let schema of structuredSchemas) {
    const createdSchema = await getSchemaMarkup({
      project,
      article,
      lang,
      schemaName: schema,
    })
    schemas.push(createdSchema)
    console.log("schemas", schemas)
    await saveSchemaMarkups(articleId, schemas);
  }

  return schemas
}

export const fetchHtml = async (url: string): Promise<string> => {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  return $('body').html() ?? "";
}

export const cleanHtml = (html: string) => {
  const $ = cheerio.load(html);
  $('style, script, [src*="base64"], img, svg, iframe, noscript, object, embed, link, meta, nav, footer, aside').remove();
  return $('body').html() ?? "";
}

const cleanMarkdown = (markdown: string) => {
  // Matches base64 images in HTML <img> tags
  const imgTagRegex = /<img[^>]+src=["']data:image\/(png|jpg|jpeg|gif);base64,[^"']*["'][^>]*>/gi;
  // Matches base64 images in Markdown syntax ![alt text](data:image/png;base64,...)
  const markdownImageRegex = /!\[.*?\]\(data:image\/(png|jpg|jpeg|gif);base64,[^)]+\)/gi;
  // Matches base64 images that start with <data: and end with >
  const dataTagRegex = /<data:image\/(png|jpg|jpeg|gif);base64,[^>]*>/gi;

  // Remove base64 images from the markdown string
  return markdown
    .replace(imgTagRegex, '')
    .replace(markdownImageRegex, '')
    .replace(dataTagRegex, '')
    .trim()
}

export const getMarkdown = (html: string) => {
  const body = cleanHtml(html)
  const markdown = NodeHtmlMarkdown.translate(body);
  return markdown
}

export const urlToVector = async ({
  url,
  userId,
  namespaceId,
  metadata = {},
}: {
  url: string;
  userId: string;
  namespaceId: string;
  metadata?: any;
}) => {
  console.log("starts url to vector")
  try {
    const namespace = upstashVectorIndex.namespace(namespaceId);
    const html = await fetchHtml(url);
    const markdown = getMarkdown(html);
    const splitter = new TokenTextSplitter({
      encodingName: "gpt2",
      chunkSize: 150,
      chunkOverlap: 50,
    });
    const output = await splitter.createDocuments([markdown]);
    const promises = output.map(async (document, index) => {
      try {
        const embeddings = await getEmbedding(document.pageContent)
        // console.log("Upsert document number:", index + 1)
        return namespace.upsert({
          id: generateUuid5(document.pageContent),
          vector: embeddings,
          metadata: {
            ...metadata,
            userId,
            content: document.pageContent
          }
        })
      } catch (error) {
        console.error(`Failed to get embeddings for content: ${document.pageContent}`, getErrorMessage(error));
        // Handle the error according to your needs, e.g., return null or a default value
        return null;
      }
    });

    await Promise.all(promises)
  } catch (error) {
    console.error("Failed to process URL to vector conversion for url:", url, getErrorMessage(error));
  }
}

export const textToVector = async ({
  text,
  userId,
  namespaceId,
  metadata = {}
}: {
  text: string;
  userId: string;
  namespaceId: string;
  metadata?: any;
}) => {
  const namespace = upstashVectorIndex.namespace(namespaceId);
  const splitter = new TokenTextSplitter({
    encodingName: "gpt2",
    chunkSize: 150,
    chunkOverlap: 50,
  });
  const output = await splitter.createDocuments([text]);
  const promises = output.map(async (document, index) => {
    try {
      const embeddings = await getEmbedding(document.pageContent)
      console.log("Training document number:", index + 1)
      return namespace.upsert({
        id: generateUuid5(document.pageContent),
        vector: embeddings,
        metadata: {
          ...metadata,
          userId,
          content: document.pageContent,
        }
      })
    } catch (error) {
      console.error(`Failed to get embeddings for content: ${document.pageContent}`, getErrorMessage(error));
      // Handle the error according to your needs, e.g., return null or a default value
      return null;
    }
  });

  return Promise.all(promises)
}

export const docsToVector = async ({
  docs,
  userId,
  namespaceId,
  metadata = {}
}: {
  docs: any[];
  userId: string;
  namespaceId: string;
  metadata?: any;
}) => {
  let promises;

  if (docs.length < 500) {
    const namespace = upstashVectorIndex.namespace(namespaceId);
    promises = docs.map(async (document, index) => {
      try {
        const embeddings = await getEmbedding(document.pageContent)
        console.log("Training document number:", index + 1);
        return namespace.upsert({
          id: generateUuid5(document.pageContent),
          vector: embeddings,
          metadata: {
            ...metadata,
            userId,
            content: document.pageContent,
          }
        })
      } catch (error) {
        console.error(`Failed to get embeddings for content: ${document.pageContent}`, getErrorMessage(error));
        // Handle the error according to your needs, e.g., return null or a default value
        return null;
      }
    });
    await Promise.all(promises);
  } else {
    promises = docs.map(async (document, index) => {
      try {
        const embeddings = await getEmbedding(document.pageContent)
        console.log("Training document number:", index + 1);
        return createBackgroundJob({
          timeoutSec: 30,
          destination: getUpstashDestination("api/background-job/add-documents"),
          body: {
            namespaceId,
            index,
            document: {
              id: generateUuid5(document.pageContent),
              vector: embeddings,
              metadata: {
                ...metadata,
                userId,
                content: document.pageContent,
              }
            }
          }
        })
      } catch (error) {
        console.error(`Failed to get embeddings for content: ${document.pageContent}`, getErrorMessage(error));
        // Handle the error according to your needs, e.g., return null or a default value
        return null;
      }
    });
    await Promise.all(promises);
    await new Promise((resolve) => setTimeout(resolve, 15000))
  }
}

export const processUrlsToMarkdownChunks = async ({
  urls,
  userId,
  projectId
}: { urls: string[]; userId: string; projectId: number }) => {
  console.log("step 1")
  const namespaceId = getProjectNamespaceId({ userId, projectId });

  console.log("step 2", urls)
  const namespaceList = await upstashVectorIndex.listNamespaces();
  console.log({ namespaceId, namespaceList })
  if (namespaceList.includes(namespaceId)) {
    console.log("step 2.1")
    await upstashVectorIndex.deleteNamespace(namespaceId);
  }

  console.log("step 3", Object.entries(urls))
  for (const [index, url] of Object.entries(urls)) {
    await createBackgroundJob({
      destination: getUpstashDestination("api/url-to-vector/execute"),
      body: {
        url,
        index,
        userId,
        namespaceId
      }
    })
  }
}

// https://upstash.com/docs/vector/features/filtering
// filter example: "population >= 1000000 AND geography.continent = 'Asia'"
export const queryVector = async ({
  namespaceId,
  query = "",
  topK = 1000,
  minScore = 0,
  filter = ""
}: {
  namespaceId: string;
  query?: string;
  topK?: number,
  minScore?: number,
  filter?: string
}) => {
  const namespace = upstashVectorIndex.namespace(namespaceId)
  const knowledges = await namespace.query({
    vector: await getEmbedding(query),
    topK,
    includeMetadata: true,
    // includeData: true,
    filter
  });

  const filteredKnowledgesByScore = knowledges.filter((item) => item.score >= minScore)
  return orderBy(filteredKnowledgesByScore, ['score'], ['desc'])
}

export const queryInstantVector = async ({
  query = "",
  docs = [],
  topK = 1,
  minScore = 0,
  filter = "",
}: {
  query: string;
  topK?: number,
  minScore?: number,
  filter?: string
  docs: {
    query: string;
    metadata: any
  }[]
}) => {
  const namespaceId = Date.now().toString()
  const namespace = upstashVectorIndex.namespace(namespaceId);

  const promises = docs.map(async (document) => {
    try {
      const embedding = await getEmbedding(document.query)
      return namespace.upsert({
        id: Date.now().toString(),
        vector: embedding,
        metadata: document.metadata
      })
    } catch (error) {
      console.error(`Failed to get embedding for content: ${document.query}`, getErrorMessage(error));
      // Handle the error according to your needs, e.g., return null or a default value
      return null;
    }
  });
  await Promise.all(promises);

  const results = await namespace.query({
    vector: await getEmbedding(query),
    topK,
    includeMetadata: true,
    // includeData: true,
    filter
  });

  await upstashVectorIndex.deleteNamespace(namespaceId);

  const filteredResultsByScore = results.filter((item) => item.score >= minScore)
  return orderBy(filteredResultsByScore, ['score'], ['desc']);
}

export const deleteNamespace = async (namespaceId: string) => {
  await upstashVectorIndex.deleteNamespace(namespaceId);
}

export const getProjectKnowledges = async ({
  userId,
  projectId,
  query,
  topK,
  minScore
}: {
  userId: string;
  projectId: number,
  query: string;
  topK: number,
  minScore: number,
}) => {
  const namespaceId = getProjectNamespaceId({ userId, projectId });
  const namespace = upstashVectorIndex.namespace(namespaceId)
  const knowledges = await namespace.query({
    vector: await getEmbedding(query),
    topK,
    includeMetadata: true,
    // includeData: true,
  })

  const filteredKnowledgesByScore = orderBy(knowledges.filter((item) => item.score >= minScore), ['score'], ['desc']).slice(0, 5)
  console.log({ filteredKnowledgesByScore });
  return filteredKnowledgesByScore
}

export const getUpstashDestination = (endpoint: string) => {
  const host = process.env.NODE_ENV === "development" ? process.env.UPSTASH_TUNNEL_HOST : "https://usehubrank.com";
  return `${host}/${endpoint}`
}

export const insertCaption = async (data: {
  caption: string;
  title?: string;
  platform: string;
  user_id: string;
  project_id: number;
  language_id: number;
  writing_style_id?: number;
  metadata: { [key: string]: any };
  cost: number
}) => {
  try {
    const { data: queuedCaption } = await supabase().from("captions")
      .insert({
        ...data,
      })
      .select("id")
      .single()
      .throwOnError();
    console.log(chalk.bgBlue("[INFO]: queuedCaption"), queuedCaption);
    return queuedCaption?.id;
  } catch (error) {
    console.error(chalk.bgRed("[ERROR]: inserting caption"), getErrorMessage(error));
    throw error;
  }
}

export const checkCredits = async ({
  userId,
  costInCredits,
  featureName,
}: {
  userId: string;
  costInCredits: number; // cost of premium feature in credits
  featureName: string;
}) => {
  console.log(chalk.yellow(`Check if user "${userId}" credits for feature "${featureName}"`));
  const { data: user } = await supabase().from("users").select().eq("id", userId).maybeSingle();
  const credits = user?.subscription?.credits ?? 0;

  // if (user?.subscription?.status !== "active") {
  //   console.log(chalk.bgRedBright(`❌ User "${userId}" doesn't have an active subscription"`))
  //   // throw new Error("inactive_subscription")
  //   throw { error: "inactive_subscription" }
  // }
  // if (!credits || credits < costInCredits) {
  //   console.log(chalk.bgRedBright(`❌ User "${userId}" doesn't have enough credit (${costInCredits} required) to access feature "${featureName}"`))
  //   // throw new Error("insufficient_credits")
  //   throw { error: "insufficient_credits" }
  // }

  return user.subscription ?? {}
}

export const getUserCredits = async (userId: string) => {
  const { data: user } = await supabase().from("users").select().eq("id", userId).maybeSingle();
  const subscription = user.subscription ?? {}
  const credits = subscription.credits ?? 0;
  return credits
}

export const deductCredits = async ({
  userId,
  costInCredits,
  featureName,
  premiumName,
}: {
  userId: string;
  costInCredits: number; // cost of premium feature in credits
  featureName: string;
  premiumName: "words" | "keywords_research" | "ai_images";
}) => {
  try {
    const { data: user } = await supabase().from("users").select("*, users_premium:users_premium!user_id(*)").eq("id", userId).maybeSingle();
    user.premium = getUserPremiumData(user);
    console.log(chalk.yellow(`Deduct ${costInCredits} credits to user id "${userId}" for feature "${featureName}"`));


    await supabase().from("users_premium").update({
      [premiumName]: Math.max(0, (user.premium?.[premiumName] ?? 0) - costInCredits),
      updated_at: new Date()
    }).eq("user_id", userId);
  } catch (e) {
    console.error("Error deduction credits", getErrorMessage(e))
  }
}

export const updateCredits = async ({ userId, credits, action }: {
  userId: string,
  credits: number,
  action: "increment" | "replace"
}) => {
  console.log(chalk.yellow(`[${action}] ${credits} credits for user "${userId}"`));
  const { data: user } = await supabase().from("users").select().eq("id", userId).maybeSingle();
  const subscription = get(user, "subscription", {});
  const userCredits = Math.max(0, user?.subscription?.credits ?? 0);
  const newCredits = action === "increment" ? userCredits + credits : credits;

  await supabase().from("users").update({
    subscription: {
      ...subscription,
      plan: {
        ...get(subscription, 'plan', {}),
        metadata: {
          ...get(subscription, 'plan.metadata', {}),
          credits: get(subscription, 'plan.metadata.credits', newCredits),
        }
      },
      credits: newCredits
    }
  })
    .eq("id", userId)
}

export const saveKnowledgeInDatabase = (data: {
  userId: string;
  projectId: number;
  content: string;
  type: string;
}) => {
  return supabase().from("knowledges").insert({
    user_id: data.userId,
    project_id: data.projectId,
    content: data.content,
    type: data.type,
    status: "training"
  }).select("id").maybeSingle().throwOnError()
}

export const updateKnowledgeStatus = (knowledgeId: number, status: string) => {
  return supabase().from("knowledges").update({ status }).eq("id", knowledgeId).throwOnError()
}

export const deleteVectors = async (ids: string[] | number[]) => {
  return upstashVectorIndex.delete(ids);
}

export const getIsYoutubeUrl = (url: string = "") => {
  return url.startsWith("https://www.youtube.com/watch?v=") || url.startsWith("https://youtu.be/") || url.startsWith("https://www.youtube.com/shorts/")
}

export const getYoutubeId = (url: string = "") => {
  if (url.startsWith("https://www.youtube.com/watch?v=")) {
    return new URL(url).searchParams.get("v")
  }
  if (url.startsWith("https://youtu.be/")) {
    return url.split("https://youtu.be/")[1].split("/")[0]
  }
  if (url.startsWith("https://www.youtube.com/shorts/")) {
    return url.split("https://www.youtube.com/shorts/")[1].split("/")[0]
  }
  return ""
}

export const getIsTwitterUrl = (url: string = "") => {
  return url.startsWith("https://x.com/") && url.includes("/status/") && !isNaN(+url.split("/").slice(-1)[0])
}

export const getYoutubeTranscript = async (url: string) => {
  try {
    const youtubeId = getYoutubeId(url);
    if (!youtubeId) throw new Error("YouTube ID not found");
    const result = await getCaptions(youtubeId);
    const transcript = result?.captions.map((item) => item.text).join(" ");

    return transcript;
  } catch (e) {
    const transcript = await transcribe(url);
    return transcript
  }
}

const getFilePathFromBlob = async (file: Blob, fileName: string) => {
  // Convert the file to a buffer
  const buffer = Buffer.from(await file.arrayBuffer());
  console.log("file", file)
  console.log("file.name", fileName)
  // Create a temporary file path
  const tempFilePath = join(tmpdir(), fileName);
  console.log("tempFilePath", tempFilePath)
  // Write the buffer to a temporary file
  writeFileSync(tempFilePath, buffer);
  return tempFilePath
}

const getFileExtensionName = (fileName: string) => {
  return fileName.split(".").slice(-1)[0];
}

export const getDocumentsFromFile = async (blob: Blob, fileName: string) => {
  const fileExtension = getFileExtensionName(fileName);
  switch (fileExtension) {
    case 'pdf':
      return new PDFLoader(blob, { splitPages: true }).load();
    case 'docx':
      return new DocxLoader(blob).load();
    case 'json':
      return new JSONLoader(blob).load();
    case 'txt':
      return new TextLoader(blob).load();
    case 'csv':
      return new CSVLoader(blob).load();
    case 'htm':
    case 'html':
    case 'ppt':
    case 'pptx':
    case 'md':
      const response = await axios({
        method: 'get',
        url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/files/${fileName}`,
        responseType: 'text'
      });
      let content = response.data;

      if (fileExtension === "html") {
        content = cleanHtml(content);
      }
      if (fileExtension === "md") {
        content = cleanMarkdown(content);
      }
      const splitter = new TokenTextSplitter({
        encodingName: "gpt2",
        chunkSize: 400,
        chunkOverlap: 50,
      });
      return splitter.createDocuments([content]);

    default:
      throw new Error(`File not supported: ${fileName}`)
  }
}

export const getTweets = async (urls: string[]) => {
  const { data } = await axios.post(`https://api.apify.com/v2/acts/quacker~twitter-url-scraper/runs?token=${process.env.APIFY_TWITTER_TOKEN ?? ""}`, {
    addUserInfo: false,
    startUrls: urls.map((url) => ({ url })),
    tweetsDesired: 1
  });

  console.log(data)
  const datasetUrl = `https://api.apify.com/v2/datasets/${data.data.defaultDatasetId}/items?token=${process.env.APIFY_TWITTER_TOKEN ?? ""}`
  console.log(datasetUrl)

  const dataset = (await new Promise((resolve) => {
    let counter = 0;
    let interval = setInterval(async () => {
      if (counter >= 40) {
        clearInterval(interval)
        resolve([])
      } else {
        const { data: result } = await axios.get(datasetUrl)
        counter++
        if (!isEmpty(result)) {
          clearInterval(interval)
          resolve(result)
        }
      }
    }, 1000);
  })) ?? []

  console.log("data")
  const tweets = dataset.map((item) => item.full_text)
  console.log("tweets", tweets);

  return tweets
}

export const publishBlogPost = async ({ url, blogPost }: any) => {
  return await axios.post(url, blogPost, {
    headers: {
      Authorization: `Bearer ${process.env.ZAPIER_TOKEN ?? ''}`
    }
  });
}

export const getTableOfContent = (markdown: string): string => {
  // Split the markdown content into lines
  const lines = markdown.split("\n");

  // Initialize the Table of Contents string
  let toc = ["## Table of Contents", ""];
  let headingCount = 0;

  // Loop through the lines to find markdown headings
  lines.forEach((line, index) => {
    // Use a regular expression to match headings (e.g., #, ##, ###)
    // example of heading ## <a name=\"introduction\"></a>Introduction
    const headingMatch = line.match(/^(#{2,3})\s+(.*)/);

    if (headingMatch) {
      const level = headingMatch[1].length; // The number of '#' characters determines the level
      const text = headingMatch[2].trim().replace(/<[^>]*>?/gm, ''); // Extract the heading text // Remove any HTML tags
      const id = text
        .toLowerCase()
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/[^\w-]+/g, ""); // Remove any non-alphanumeric characters

      // Increment the heading count
      headingCount++;

      // Add indentation for subheadings based on level
      const indentation = "   ".repeat(level - 1);

      // Add the heading to the Table of Contents
      toc.push(`${indentation}* [${text}](#${id})`);
    }
  });

  return `${toc.join("\n")}\n\n`;
};


export const getHemingwayStats = (text) => {
  const result = [];
  // Split the input text into sentences/phrases based on dots or new lines
  const sentences = text.split(/(?<=\.)\s+|\n/);

  let currentPosition = 0; // Keep track of the position in the text

  sentences.forEach(sentence => {
    const trimmedSentence = sentence.trim();
    const wordCount = trimmedSentence.split(/\s+/).filter(word => word.length > 0).length;
    const letters = trimmedSentence.replace(/\s+/g, '').length;

    // Hemingway app level calculation
    const level = Math.round(4.71 * (letters / wordCount) + 0.5 * wordCount - 21.43);

    // Set difficulty based on the word count and Hemingway readability level
    let difficultyLevel = null;
    if (wordCount >= 14) {
      if (level >= 10 && level < 14) {
        difficultyLevel = "hard";
      } else if (level >= 14) {
        difficultyLevel = "very_hard";
      }
    }

    // Only include sentences with at least 10 words
    if (wordCount >= 10 && difficultyLevel) {
      const start = currentPosition;
      const end = start + sentence.length;

      // Push the sentence object to the result array
      result.push({
        text: trimmedSentence,
        word_count: wordCount,
        level: difficultyLevel,
        start: start,
        end: end
      });
    }

    // Update the currentPosition to the end of the sentence, plus 1 for space/new line or dot
    currentPosition += sentence.length + 1;
  });

  return result;
}

const formatWritingStyle = (writingStyle: {
  purposes?: string[];
  emotions?: string[];
  vocabularies?: string[];
  sentence_structures?: string[];
  perspectives?: string[];
  writing_structures?: string[];
  instructional_elements?: string[];
}) => {
  let writingStylePrompt = "";
  writingStylePrompt += writingStyle.purposes && writingStyle.purposes.length > 0 ? `\nPurposes: ${writingStyle.purposes.join(', ')}` : "";
  writingStylePrompt += writingStyle.emotions && writingStyle.emotions.length > 0 ? `\nEmotions: ${writingStyle.emotions.join(', ')}` : "";
  writingStylePrompt += writingStyle.vocabularies && writingStyle.vocabularies.length > 0 ? `\nVocabularies: ${writingStyle.vocabularies.join(', ')}` : "";
  writingStylePrompt += writingStyle.sentence_structures && writingStyle.sentence_structures.length > 0 ? `\nSentence structures: ${writingStyle.sentence_structures.join(', ')}` : "";
  writingStylePrompt += writingStyle.perspectives && writingStyle.perspectives.length > 0 ? `\nPerspectives: ${writingStyle.perspectives.join(', ')}` : "";
  writingStylePrompt += writingStyle.writing_structures && writingStyle.writing_structures.length > 0 ? `\nWriting structures: ${writingStyle.writing_structures.join(', ')}` : "";
  writingStylePrompt += writingStyle.instructional_elements && writingStyle.instructional_elements.length > 0 ? `\nInstructional elements: ${writingStyle.instructional_elements.join(', ')}` : "";
  return writingStylePrompt;
}

const formatAdditionalInstructions = (values: {
  with_introduction: boolean;
  with_conclusion: boolean;
  with_key_takeways: boolean;
  with_faq: boolean;
  language: string;
  additional_information?: string;
  keywords?: string[];
  sitemaps?: string[];
}) => {
  let additionalInstructionsPrompt = "";
  additionalInstructionsPrompt += values.with_introduction ? "\n- add an introduction, it is no more than 100 words (it never has sub-sections)" : "\n- do not add an introduction"
  additionalInstructionsPrompt += values.with_conclusion ? "\n- add a conclusion, it is no more than 200 words (it never has sub-sections)" : "\n- do not add a conclusion"
  additionalInstructionsPrompt += values.with_key_takeways ? "\n- add a key takeways, it is a list of key points or short paragraph (it never has sub-sections)" : "\n- do not add a key takeways"
  additionalInstructionsPrompt += values.with_faq ? "\n- add a FAQ" : "\n- do not add a FAQ";
  additionalInstructionsPrompt += `\n- Language: ${values.language}`;
  if (values.additional_information) {
    additionalInstructionsPrompt += `\n- Additional information: ${values.additional_information}`
  }
  if (values.keywords && values.keywords.length > 0) {
    additionalInstructionsPrompt += `\n- Keywords (include relevant keywords only, avoid keywords stuffing):\n${values.keywords.join('\n')}\n\n`
  }
  if (values.sitemaps && values.sitemaps.length > 0) {
    additionalInstructionsPrompt += `\n- Sitemap (include relevant links only, up to 10 links):\n${values.sitemaps.join('\n')}\n\n`
  }
  return additionalInstructionsPrompt;
}

const formatCompetitorsOutline = (competitors_outline: any[]) => {
  let competitorsOutlinePrompt = "";
  if (competitors_outline && competitors_outline.length > 0) {
    competitorsOutlinePrompt += `\n- Competitors outline:\n${JSON.stringify(competitors_outline, null, 2)}\n`
  }
  return competitorsOutlinePrompt;
}

const formatMarkdownTableOfContentExample = () => {
  return `\nExample
## Contents
1. [Example](#example)
2. [Example2](#example2)
3. [Third Example](#third-example)
`;
}

const getPromptDate = () => {
  return `Date: ${format(new Date(), "dd/MM/yyyy")}`
}

export const getOutlinePrompt = (values: any) => {
  let prompt = `[outline plan]

  ${getPromptDate()}

  Write an article outline for the headline: "${values.title}"
- the content type is ${values.content_type}
- the article will have roughly ${values.word_count} words
- a section that has more than 200 words should be split into sub-sections or paragraphs
- Don't prefix sections with numbers
- Add anchors
`;

  if (values.youtube_transcript) {
    prompt += `\nWrite the article based on this youtube transcript: ${values.youtube_transcript.slice(0, 10000)}`
  }

  prompt += formatWritingStyle(values.writingStyle);
  prompt += formatAdditionalInstructions(values);
  prompt += formatCompetitorsOutline(values.competitors_outline);
  prompt += formatMarkdownTableOfContentExample();

  return prompt;
}

export const getOutlineSchema = ({
  with_sections_image,
  with_youtube_videos,
}: { with_sections_image?: boolean; with_youtube_videos?: boolean }) => {
  const sectionSchema: any = {
    name: z.string().describe("Section's name"),
    word_count: z.number().describe("Section's word count"),
    keywords: z.string().describe("Comma separated keywords"),
    // NOTE: should use embeddings instead at the section level
    internal_links: z.array(z.string()).describe("Include relevant link you find in the sitemap, leave it empty otherwise."),
    search_query: z.string().describe("Search query to get/extract up-to-date information on the web/serp"),
    purposes: z.array(z.string()).optional().describe(`Options: ${purposes.map(i => i.label).join()}`),
    emotions: z.array(z.string()).optional().describe(`Options: ${emotions.map(i => i.label).join()}`),
    vocabularies: z.array(z.string()).optional().describe(`Options: ${vocabularies.map(i => i.label).join()}`),
    sentence_structures: z.array(z.string()).optional().describe(`Options: ${sentenceStructures.map(i => i.label).join()}`),
    perspectives: z.array(z.string()).optional().describe(`Options: ${perspectives.map(i => i.label).join()}`),
    writing_structures: z.array(z.string()).optional().describe(`Options: ${writingStructures.map(i => i.label).join()}`),
    instructional_elements: z.array(z.string()).optional().describe(`Options: ${instructionalElements.map(i => i.label).join()}`),
    tones: z.array(z.string()).optional().describe(`Options: ${tones.map(i => i.label).join()}`),
  }

  if (with_sections_image) {
    // sectionSchema.image = z.boolean().describe(`At least 40% of the sections must contain an image`);
    sectionSchema.image = z.boolean().describe(`At least 40% of the sections must contain an image`);
    sectionSchema.image_description = z.boolean().describe("Search query to get/extract up-to-date information on the web/serp");
  }
  if (with_youtube_videos) {
    sectionSchema.youtube_search = z.string().optional().describe("At least one section must have a youtube search query");
  }

  return z.object({
    table_of_content_markdown: z.string().describe("Don't include the article title but only h2 and, don't number them."),
    sections: z.array(
      z.object(sectionSchema)
    ),
  })
}

const addWritingStyleSection = (prompt: string, style: string[], label: string) => {
  if (style.length > 0) {
    prompt += `\n${label}: ${style.join(', ')}`;
  }
};

export const getMetaDescriptionPrompt = (values: {
  title: string;
  content_type?: string;
  seed_keyword?: string;
  outline?: string;
  writingStyle?: {
    tones?: string[];
    purposes?: string[];
    emotions?: string[];
    vocabularies?: string[];
    perspectives?: string[];
  };
  keywords?: string[];
  competitors?: { description: string }[];
}) => {
  let prompt = `[description]

  ${getPromptDate()}

  Write a valuable and engaging article description.

  Headline: ${values.title}
  Content type: ${values.content_type ?? ""}
  Seed keyword: ${values.seed_keyword ?? ""}
  Outline: ${values.outline ?? ""}
  `

  addWritingStyleSection(prompt, values.writingStyle?.tones ?? [], "Tones");
  addWritingStyleSection(prompt, values.writingStyle?.purposes ?? [], "Purposes");
  addWritingStyleSection(prompt, values.writingStyle?.emotions ?? [], "Emotions");
  addWritingStyleSection(prompt, values.writingStyle?.vocabularies ?? [], "Vocabularies");
  addWritingStyleSection(prompt, values.writingStyle?.perspectives ?? [], "Perspectives");

  if (values.keywords && values.keywords.length > 0) {
    prompt += `\n- Keywords (include relevant keywords only):\n${values.keywords.join('\n')}\n\n`;
  }

  if (values.competitors && values.competitors.length > 0) {
    prompt += `\n- Competitors description:\n${values.competitors.map(competitor => competitor.description).join('\n')}\n\n`;
  }

  return prompt;
}

export const getMetaDescriptionSchema = () => {
  return z.object({
    description: z.string().describe("160 characters maximum, no emoji."),
  })
}

export const getHookSchema = () => {
  return z.object({
    markdown: z.string().describe("hook written in markdown (no title/heading added)."),
  })
}


export const getHookPrompt = (values: any) => {
  let prompt = `[Hook]

  ${getPromptDate()}

  Headline: ${values?.headline}
  Outline: ${values?.outline}
  `;

  addWritingStyleSection(prompt, values.writingStyle?.tones ?? [], "Tones");
  addWritingStyleSection(prompt, values.writingStyle?.purposes ?? [], "Purposes");
  addWritingStyleSection(prompt, values.writingStyle?.emotions ?? [], "Emotions");
  addWritingStyleSection(prompt, values.writingStyle?.vocabularies ?? [], "Vocabularies");
  addWritingStyleSection(prompt, values.writingStyle?.perspectives ?? [], "Perspectives");

  // NOTE: do I keep this part, it could contribute to keywords stuffing
  // if (!isEmpty(values?.keywords)) {
  //   prompt += `\n\nKeywords:\n${values.keywords.join('\n')}\n`
  // }

  prompt += `
  Write a 1-2 sentence hook for the article "${values?.title}"
  Choose the hook type that fit the best this article, (Question, Anecdote, Fact/Statistic, Quotation, Bold Statement, Problem-Solution, Surprise, Empathy, Challenge, Personal Story, Prediction, Curiosity, Humor, Rhetorical Question, Metaphor/Analogy)
  Elements that make up a good hook
  - State a fact or a statistic
  - Begin your writing with a quote
  - Ask a question
  - Tell a personal story
  - Make a statement
  - Start with a figure of speech
  - Don’t hesitate to contradict popular beliefs
  - Use humor
  - Connect emotionally to the reader
  - Use a contradictory statement
  - Define a term
  - Explain a common misconception.`;

  return prompt;
}

export const getSectionSchema = () => {
  return z.object({
    markdown: z.string().describe("section written in markdown."),
  })
}

export const getSectionPrompt = (values: any): string => {
  const hasImage: boolean = !!values?.image?.href;
  const hasVideo: boolean = !!values?.video?.id;

  let prompt: string = `[write]

  ${getPromptDate()}

  Headline: ${values?.headline}
  Section heading prefix: ${values?.prefix}
  Outline:
  ${values?.outline}


  Write the section "${values?.name}" with a maximum of ${values?.word_count} words.
  Section heading prefix: ${values?.prefix}
  - Do not add heading for the hook if there is any
  - Do not make up fact, statistic or fake story
  `;

  addWritingStyleSection(prompt, values?.tones ?? [], "Tones");
  addWritingStyleSection(prompt, values?.purposes ?? [], "Purposes");
  addWritingStyleSection(prompt, values?.emotions ?? [], "Emotions");
  addWritingStyleSection(prompt, values?.vocabularies ?? [], "Vocabularies");
  addWritingStyleSection(prompt, values?.perspectives ?? [], "Perspectives");
  addWritingStyleSection(prompt, values?.sentence_structures ?? [], "Sentence structures");
  addWritingStyleSection(prompt, values?.writing_structures ?? [], "Writing structures");
  addWritingStyleSection(prompt, values?.instructional_elements ?? [], "Instructional elements");

  if (values?.call_to_action) {
    prompt += `\nCall to action instructions:\n${values.call_to_action}`;
    if (values?.call_to_action_example) {
      prompt += `\nCall to action instructions:\n${values.call_to_action}`
    }
  } else {
    prompt += `\n- Do not add a CTA at the end`
  }

  // if (values?.internal_links?.length > 0) {
  //   prompt += `\nInternal links you could include (no call to action):\n${values.internal_links?.join('\n')}\n\n`
  // }

  // if (values?.external_links?.length > 0) {
  //   prompt += `\nExternal links you could include (no call to action):\n${values.external_links?.join('\n')}\n\n`
  // }

  if (values?.external_resources?.length > 0) {
    prompt += `\nExternal resources for extra context:\n${JSON.stringify(values.external_resources, null, 2)}\n\n`
  }

  // if (hasImage) {
  //   prompt += `\nInclude the text @@image@@ as a placeholder that will be replaced by an image named "${values.image.alt}"`
  // }
  if (hasImage) {
    prompt += `\nInclude the text @@image@@ as a placeholder that will be replaced by an image`
  }

  if (hasVideo) {
    prompt += `\nInclude the text @@video@@ as a placeholder that will be replaced by a video named "${values.video.name}"`
  }

  if (hasImage && hasVideo) {
    prompt += `\nDon't put image and video next to each other, preferrably not both in the same section`
  }

  prompt += `
  Primary instructions:
  - Leverage markdown syntaxes (strikethrough, table, italic, bold, quote, etc.) to make the content appealing and easier to read.
  - Add h3 sub-sections with ### if the content as more than 2 paragraphs.
  - Don't use h1 at all.
  - Add anchor to the section here is an example for a h2: ## <a name="heading-example"></a>Heading example
  - Prefer Active Voice
  - Avoid the use of adverbs as much as possible
  - Avoid Passive Voice
  - Consider Sentence Variety
  - IMPORTANT: Do not use adverbs at all
  - IMPORTANT: Diversify vocabulary
  - IMPORTANT: vary the sentence structure and tone to make it sound more conversational.
  - IMPORTANT: avoid words like the following or write their alternative: ${avoidWords.join()}
  - do not use emojis
  - do not introduce any followin section`

  if (values?.custom_prompt) {
    prompt += `\nSecondary instructions (does not override primary instructions):\n${values?.custom_prompt}`
  }

  prompt += `\nOutput a markdown.`

  return prompt.replaceAll("\t", "")
}

export const getAllUrlsFromAnyData = (data: any) => {
  const urls: string[] = [];
  const handleString = (value: string) => {
    // Check if it's a valid URL (starts with https:// and has no spaces)
    const urlPattern = /^https:\/\/[^\s]+$/i;
    if (urlPattern.test(value) && !value.startsWith("https://www.google")) {
      urls.push(value);
    }
  };

  const handleArray = (value: any[]) => {
    value.forEach(item => {
      handleTypes(item);
    });
  };

  const handleObject = (value: object) => {
    Object.values(value).forEach(item => {
      handleTypes(item);
    });
  };

  const handleTypes = (value: any) => {
    if (typeof value === 'string') {
      handleString(value);
    } else if (Array.isArray(value)) {
      handleArray(value);
    } else if (typeof value === 'object' && value !== null) {
      handleObject(value);
    }
  };

  handleTypes(data);

  return urls;
};

export const getRelevantUrlsSchema = () => {
  return z.string().describe("list of urls")
}

export const getRelevantUrlsPrompt = ({
  query,
  count,
  urls,
}: { query: string; count: number; urls: string[] }) => {
  return [
    '[relevant urls]',
    getPromptDate(),
    `Give me up to ${count} of the most relevant urls in the list to the query "${query}"`,
    `urls list:\n- ${urls.join('\n- ')}`,
  ].join('\n\n')
}

export const getRelevantYoutubeVideoSchema = () => {
  return z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
  })
}

export const getRelevantYoutubeVideoPrompt = ({
  query,
  youtubeVideos,
}: {
  query: string;
  youtubeVideos: {
    id: any;
    name: any;
    description: any;
  }[]
}) => {
  return [
    '[relevant youtube video]',
    getPromptDate(),
    `Give the most relevant video to the query "${query}"`,
    `Videos:\n${JSON.stringify(youtubeVideos, null, 2)}`,
  ].join('\n\n')
}

const MAX_CONCURRENCY = 3;

export const getWritingConcurrencyLeft = async () => {
  const { count } = await supabase().from("blog_posts").select("id", { count: "exact" }).eq("status", "writing");
  const concurrencyLeft = Math.max(0, MAX_CONCURRENCY - (count ?? 0));
  return concurrencyLeft
}

export const getUserPremiumData = (user: any) => {
  return user?.users_premium?.[0] ?? {};
}