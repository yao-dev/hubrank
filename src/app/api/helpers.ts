import { supabaseAdmin } from "@/helpers/supabase";
import chalk from "chalk";
import { marked } from "marked";
import { generateUuid5 } from 'weaviate-ts-client';
import { AI } from "./AI";
import axios from "axios";
import { compact, isEmpty, orderBy } from "lodash";
import { getSerpData } from "@/helpers/seo";
import { Index } from "@upstash/vector";
import { NodeHtmlMarkdown } from "node-html-markdown";
import * as cheerio from "cheerio";
import { TokenTextSplitter } from "langchain/text_splitter";
import { createBackgroundJob } from "@/helpers/qstash";
import { YoutubeTranscript } from 'youtube-transcript';
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

export const upstashVectorIndex = new Index({
  url: process.env.NEXT_PUBLIC_UPSTASH_VECTOR_URL || "",
  token: process.env.NEXT_PUBLIC_UPSTASH_VECTOR_TOKEN || "",
})

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");

export const saveWritingCost = async ({ articleId, cost }: any) => {
  try {
    await supabase.from('blog_posts').update({ cost }).eq("id", articleId).throwOnError();
  } catch (error) {
    console.error(chalk.bgRed("[ERROR]: updating cost"), error);
    throw error;
  }
}

export const insertBlogPost = async (data: any) => {
  try {
    const { data: queuedArticle } = await supabase.from("blog_posts")
      .insert({
        title: data.title,
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
      })
      .select("id")
      .single()
      .throwOnError();
    console.log(chalk.bgBlue("[INFO]: queuedArticle"), queuedArticle);
    return queuedArticle?.id;
  } catch (error) {
    console.error(chalk.bgRed("[ERROR]: inserting blog post"), error);
    throw error;
  }
}

export const updateBlogPostStatus = async (articleId: number, status: string) => {
  try {
    await supabase
      .from('blog_posts')
      .update({ status })
      .eq("id", articleId)
      .throwOnError();
  } catch (error) {
    console.error(chalk.bgRed("[ERROR]: updating blog post status"), error);
    throw error;
  }
}

export const updateBlogPost = async (articleId: number, updates: any) => {
  try {
    await supabase
      .from('blog_posts')
      .update(updates)
      .eq("id", articleId)
      .throwOnError();
  } catch (error) {
    console.error(chalk.bgRed("[ERROR]: updating blog post"), error);
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
      const { data } = await supabase.from("writing_styles").select().eq("id", writingStyleId).limit(1).single();
      writingStyle = data;
    } catch (error) {
      console.error(chalk.bgRed("[Error]: fetching writing style"), error);
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
    console.error(chalk.bgRed("[Error]: generating hook"), error);
    throw error;
  }
  console.log(`[end]: hook`);
}

const getRephraseInstruction = (text: string) => {
  const wordsCount = text.split(" ").length;
  // return compact([
  //   "- diversify vocabulary",
  //   "- reduce words duplication by paraphrasing them, use synonym or different forms",
  //   "- do not use adverbs",
  //   "- do not use compound adverbs",
  //   "- use active voice",
  //   wordsCount > 40 && "- split the paragraph",
  //   "- use idioms",
  //   "- use phrasal verbs",
  //   shuffle([
  //     "- end with a question",
  //     "- start with a question",
  //     [...new Array(15)].map(i => "")
  //   ].flat())[0]
  // ]).join('\n')

  return "diversify vocabulary, remove adverbs, remove compound adverbs, use active voice, idioms and phrasal verbs, edit like a human."
}

export const writeSection = async ({
  ai,
  index,
  section,
  title,
  outline,
  articleId
}: {
  ai: any;
  index: number;
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
  title: string;
  outline: string;
  articleId: number;
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

    // await saveWritingCost({ articleId, cost: ai.cost });

    // const rephraseInstruction = getRephraseInstruction(content)

    // let stats = getSummary(content);
    // if (stats.FleschKincaidGrade > 12) {
    //   console.log("- rephrase");
    //   content = await ai.rephrase(content, rephraseInstruction);
    //   console.log("- rephrase done");
    // }
    console.log("- add section to article", content);
    // ai.addArticleContent(ai.parse(content, "markdown"));
    ai.addArticleContent(content);
  } catch (error) {
    console.error(chalk.bgRed(`[ERROR] generating section ${index}:`), error);
    throw error;
  }
  console.log(`[end]: ${index}) ${section.name}`);
}

export const cleanArticle = (article: string) => {
  return article.replaceAll("```markdown", "").replaceAll("```", "");
}

export const convertMarkdownToHTML = (markdown: string) => {
  console.log("parse markdown to html");
  const html = marked.parse(markdown);
  console.log("parse markdown to html done");
  return html
}

export const markArticleAsReadyToView = async ({
  markdown,
  html,
  writingTimeInSeconds,
  cost,
  articleId,
  wordCount,
  metaDescription,
  featuredImage,
}: any) => {
  try {
    console.log(chalk.yellow(JSON.stringify({
      markdown,
      html,
      status: 'ready_to_view',
      writing_time_sec: writingTimeInSeconds,
      word_count: wordCount,
      cost,
      featured_image: featuredImage,
      meta_description: metaDescription
    }, null, 2)));

    const $ = cheerio.load(html);
    const ogImageUrl = $('img').first().attr('src') ?? "";

    await supabase
      .from('blog_posts')
      .update({
        markdown,
        html,
        status: 'ready_to_view',
        writing_time_sec: writingTimeInSeconds,
        word_count: wordCount,
        cost,
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
    await supabase
      .from('blog_posts')
      .update({
        status: 'error',
        error: JSON.stringify(error),
      })
      .eq("id", articleId)
      .throwOnError();
  } catch (updateError) {
    console.error(chalk.bgRed("[ERROR]: updating blog post status to 'error'"), updateError);
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
  const promises = urlSubsets.map((url) => {
    return namespace.upsert({
      id: url,
      data: url,
      metadata: {
        article_id: articleId,
        url
      },
    })
  });

  await Promise.all(promises)

  console.log("query", query)

  const result = await namespace.query({
    data: query,
    topK: 500,
    // includeMetadata: true,
    includeData: true
  });

  await upstashVectorIndex.deleteNamespace(namespaceId);

  console.log("retrieved urls", result)

  return orderBy(result.filter((item) => item.score >= 0.50), ['score'], ['desc']).slice(0, topK).map(item => item.data) as string[];
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
  const promises = subset.map((keyword) => {
    return namespace.upsert({
      id: keyword,
      data: keyword,
      metadata: {
        article_id: articleId,
        keyword
      },
    })
  });

  await Promise.all(promises);

  const result = await namespace.query({
    data: query,
    topK: 500,
    includeData: true
  });

  await upstashVectorIndex.deleteNamespace(namespaceId);

  return orderBy(result.filter((item) => item.score >= 0.50), ['score'], ['desc']).slice(0, topK).map(item => item.data) as string[];
}

export const getProjectById = async (projectId: number) => {
  return supabase.from("projects").select("*").eq("id", projectId).maybeSingle()
}

export const saveSchemaMarkups = async (postId: number, schemaMarkups: any) => {
  return supabase.from("blog_posts").update({ schema_markups: schemaMarkups }).eq("id", postId);
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

export const getKeywordsForKeywords = async ({
  keyword,
  countryCode,
}: any) => {
  const { data } = await axios({
    method: "POST",
    url: "https://api.dataforseo.com/v3/keywords_data/google/keywords_for_keywords/live",
    data: [{ "search_partners": false, "keywords": [keyword], "language_code": countryCode || "en", "sort_by": "relevance", "date_interval": "next_month", "include_adult_keywords": false }],
    auth: {
      username: process.env.NEXT_PUBLIC_DATAFORSEO_USERNAME || "",
      password: process.env.NEXT_PUBLIC_DATAFORSEO_PASSWORD || ""
    },
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (isEmpty(data.tasks[0].result)) {
    return {
      result: [],
      result_count: 0,
      keywords: []
    }
  }

  return {
    result: data.tasks[0].result,
    result_count: data.tasks[0].result_count,
    keywords: data.tasks[0].result.map((i) => i.keyword)
  }
}

export const getYoutubeVideosForKeyword = async ({
  keyword,
  languageCode,
  locationCode,
}: any) => {
  const { data } = await axios({
    method: "POST",
    url: 'https://api.dataforseo.com/v3/serp/google/organic/live/advanced',
    data: [{
      keyword: `site:youtube.com ${keyword}`,
      location_code: locationCode,
      language_code: languageCode,
      device: 'desktop',
      os: 'windows',
      depth: 10,
    }],
    auth: {
      username: process.env.NEXT_PUBLIC_DATAFORSEO_USERNAME || "",
      password: process.env.NEXT_PUBLIC_DATAFORSEO_PASSWORD || ""
    },
    headers: {
      "Content-Type": "application/json"
    }
  });

  console.log("youtube video for keyword", `site:youtube.com ${keyword}`)
  console.log("result", data.tasks[0].result)

  return {
    videos: isEmpty(data.tasks[0].result) || isEmpty(data.tasks[0].result[0]?.items) ? [] : data.tasks[0].result[0].items.filter(i => {
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
  count
}: any) => {
  if (!language) {
    throw new Error("language not found")
  }

  const { data: serpDataForSeedKeyword } = await getSerpData({ keyword: seedKeyword, depth: 20, lang: language.code, location_code: language.location_code });

  if (serpDataForSeedKeyword?.tasks_error > 0 || !serpDataForSeedKeyword) {
    throw new Error("error fetching competitors ranking for main keyword")
  }

  const competitorsHeadlines = serpDataForSeedKeyword?.tasks[0].result
    .map((item: any) => {
      return item?.items
        .filter((subItem: any) => subItem.type === "organic")
        .map((subItem: any) => {
          return subItem.title
        })
    })
    .flat(Infinity);

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

  const headlines = compact(response.split("\n"));
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
}

export const fetchHtml = async (url: string): Promise<string> => {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  return $('body').html() ?? "";
}

const cleanHtml = (html: string) => {
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
  metadata = {}
}: {
  url: string;
  userId: string;
  namespaceId: string;
  metadata?: any;
}) => {
  const namespace = upstashVectorIndex.namespace(namespaceId);
  const html = await fetchHtml(url);
  const markdown = getMarkdown(html);
  const splitter = new TokenTextSplitter({
    encodingName: "gpt2",
    chunkSize: 150,
    chunkOverlap: 50,
  });
  const output = await splitter.createDocuments([markdown]);
  const promises = output.map((document, index) => {
    console.log("Training document number:", index + 1)
    return namespace.upsert({
      id: generateUuid5(document.pageContent),
      data: document.pageContent,
      metadata: {
        ...metadata,
        userId,
        content: document.pageContent
      }
    })
  });

  await Promise.all(promises)
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
  const promises = output.map((document, index) => {
    console.log("Training document number:", index + 1)
    return namespace.upsert({
      id: generateUuid5(document.pageContent),
      data: document.pageContent,
      metadata: {
        ...metadata,
        userId,
        content: document.pageContent,
      }
    })
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
    promises = docs.map((document, index) => {
      console.log("Training document number:", index + 1);
      return namespace.upsert({
        id: generateUuid5(document.pageContent),
        data: document.pageContent,
        metadata: {
          ...metadata,
          userId,
          content: document.pageContent,
        }
      })
    });
    await Promise.all(promises);
  } else {
    promises = docs.map((document, index) => {
      console.log("Training document number:", index + 1);
      return createBackgroundJob({
        timeoutSec: 30,
        destination: getUpstashDestination("api/background-job/add-documents"),
        body: {
          namespaceId,
          index,
          document: {
            id: generateUuid5(document.pageContent),
            data: document.pageContent,
            metadata: {
              ...metadata,
              userId,
              content: document.pageContent,
            }
          }
        }
      })
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
    data: query,
    topK,
    includeMetadata: true,
    includeData: true,
    filter
  });

  const filteredKnowledgesByScore = knowledges.filter((item) => item.score >= minScore)
  return orderBy(filteredKnowledgesByScore, ['score'], ['desc'])
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
    data: query,
    topK,
    includeMetadata: true,
    includeData: true,
  })

  const filteredKnowledgesByScore = orderBy(knowledges.filter((item) => item.score >= minScore), ['score'], ['desc']).slice(0, 5)
  console.log({ filteredKnowledgesByScore });
  return filteredKnowledgesByScore
}

export const getUpstashDestination = (endpoint: string) => {
  const host = process.env.NODE_ENV === "development" ? process.env.UPSTASH_TUNNEL_HOST : "https://app.usehubrank.com";
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
    const { data: queuedCaption } = await supabase.from("captions")
      .insert({
        ...data,
      })
      .select("id")
      .single()
      .throwOnError();
    console.log(chalk.bgBlue("[INFO]: queuedCaption"), queuedCaption);
    return queuedCaption?.id;
  } catch (error) {
    console.error(chalk.bgRed("[ERROR]: inserting caption"), error);
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
  const { data: user } = await supabase.from("users").select().eq("id", userId).maybeSingle();
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
  const { data: user } = await supabase.from("users").select().eq("id", userId).maybeSingle();
  const subscription = user.subscription ?? {}
  const credits = subscription.credits ?? 0;
  return credits
}

export const deductCredits = async ({
  userId,
  costInCredits,
  featureName,
}: {
  userId: string;
  costInCredits: number; // cost of premium feature in credits
  featureName: string;
}) => {
  const { data: user } = await supabase.from("users").select().eq("id", userId).maybeSingle();
  const subscription = user.subscription ?? {}
  const credits = subscription.credits ?? 0;

  console.log(chalk.yellow(`Deduct ${costInCredits} credits to user id "${userId}" for feature "${featureName}"`));

  await supabase.from("users").update({
    subscription: {
      ...subscription,
      credits: Math.max(0, credits - costInCredits)
    }
  })
    .eq("id", userId)
}

export const updateCredits = async ({ userId, credits, action }: {
  userId: string,
  credits: number,
  action: "increment" | "replace"
}) => {
  console.log(chalk.yellow(`[${action}] ${credits} credits for user "${userId}"`));
  const { data: user } = await supabase.from("users").select().eq("id", userId).maybeSingle();
  const subscription = user?.subscription ?? {};
  const userCredits = Math.max(0, user?.subscription?.credits ?? 0);
  const newCredits = action === "increment" ? userCredits + credits : credits;

  await supabase.from("users").update({
    subscription: {
      ...subscription,
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
  return supabase.from("knowledges").insert({
    user_id: data.userId,
    project_id: data.projectId,
    content: data.content,
    type: data.type,
    status: "training"
  }).select("id").maybeSingle().throwOnError()
}

export const updateKnowledgeStatus = (knowledgeId: number, status: string) => {
  return supabase.from("knowledges").update({ status }).eq("id", knowledgeId).throwOnError()
}

export const deleteVectors = async (ids: string[] | number[]) => {
  return upstashVectorIndex.delete(ids);
}

export const getIsYoutubeUrl = (url: string) => {
  return url.startsWith("https://www.youtube.com/watch?v=") || url.startsWith("https://youtu.be/")
}

export const getYoutubeTranscript = async (url: string) => {
  // const loader = YoutubeLoader.createFromUrl("https://youtu.be/bZQun8Y4L2A", {
  //   language: "en",
  //   addVideoInfo: true,
  // });
  const transcriptJson = await YoutubeTranscript.fetchTranscript(url);
  const transcriptText = transcriptJson.map((chunk) => {
    return chunk.text
  }).join(" ");
  return transcriptText;
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