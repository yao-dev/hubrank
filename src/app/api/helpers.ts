import { supabaseAdmin } from "@/helpers/supabase";
import chalk from "chalk";
import { marked } from "marked";
import { chromium } from 'playwright';
import weaviate, { WeaviateClient, ApiKey, generateUuid5 } from 'weaviate-ts-client';
import { getSummary } from 'readability-cyr';
import { AI } from "./AI";
import axios from "axios";
import { isEmpty } from "lodash";

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

export const getWritingStyle = async (writingStyleId?: number) => {
  let writing_style = "";
  if (writingStyleId) {
    try {
      const { data: writingStyle } = await supabase.from("writing_styles").select("text").eq("id", writingStyleId).limit(1).single();
      writing_style = writingStyle?.text ?? "";
    } catch (error) {
      console.error(chalk.bgRed("[Error]: fetching writing style"), error);
      throw error;
    }
  }
  return writing_style;
}

export const writeHook = async ({
  ai,
  title,
  outline,
  seed_keyword,
  keywords,
  perspective,
  purpose,
  tones,
  article_id
}: any) => {
  console.log(`[start]: hook`);
  try {
    let hook = await ai.hook({
      title,
      outline,
      seed_keyword,
      keywords,
      // perspective,
      // purpose,
      // tones,
    });

    // await saveWritingCost({ articleId: article_id, cost: ai.cost });
    const rephraseInstruction = getRephraseInstruction(hook)

    let stats = getSummary(hook);
    if (stats.FleschKincaidGrade > 12) {
      console.log("- rephrase");
      hook = await ai.rephrase(hook, rephraseInstruction);
      console.log("- rephrase done");
    }
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
    perspective: string;
    image?: {
      href: string;
      alt: string;
    },
    youtube_video?: any;
    internal_links?: string[];
    images?: string[],
    tones?: any;
    purpose: string;
    video_url?: string;
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

    // await saveWritingCost({ articleId, cost: ai.cost });

    const rephraseInstruction = getRephraseInstruction(content)

    let stats = getSummary(content);
    if (stats.FleschKincaidGrade > 12) {
      console.log("- rephrase");
      content = await ai.rephrase(content, rephraseInstruction);
      console.log("- rephrase done");
    }
    console.log("- add section to article");
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

export const convertMarkdownToHTML = (article: string) => {
  console.log("parse markdown to html");
  const html = marked.parse(article);
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
  featuredImage
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
    await supabase
      .from('blog_posts')
      .update({
        markdown,
        html,
        status: 'ready_to_view',
        writing_time_sec: writingTimeInSeconds,
        word_count: wordCount,
        cost,
        featured_image: featuredImage,
        meta_description: metaDescription
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
  // .trim()
  // .replaceAll("\n\n\n\n", "\n")
  // .replaceAll("\n\n\n", "\n")
  // .replaceAll("\n\n", "\n")
}

class Vector {
  private client: WeaviateClient;
  public results: any;

  constructor() {
    this.client = weaviate.client({
      scheme: 'https',
      host: process.env.WEAVIATE_HOST || "",
      apiKey: new ApiKey(process.env.WEAVIATE_API_KEY || ""),
      headers: { 'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY || "" }
    });
  }

  async addSchema(className: string): Promise<void> {
    try {
      await this.client.schema.classCreator().withClass({
        'class': className,
        'vectorizer': 'text2vec-openai',  // If set to "none" you must always provide vectors yourself. Could be any other "text2vec-*" also.
        'moduleConfig': {
          'text2vec-openai': {},
          'generative-openai': {}  // Ensure the `generative-openai` module is used for generative queries
        },
      }).do();
    } catch (e) {
      console.error(e)
    }
  }

  async query({ className, fields, keywords, limit }: {
    className: string;
    fields: string;
    keywords: string[];
    limit: number
  }): Promise<any> {
    const res = await this.client.graphql
      .get()
      .withClassName(className)
      .withFields(fields)
      .withNearText({ concepts: keywords })
      .withLimit(limit)
      .do();

    console.info("query result", JSON.stringify(res, null, 2));
    this.results = res;
    return res;
  }

  async importData(className: string, keyId: string, dataList: any): Promise<void> {
    let batcherId = this.client.batch.objectsBatcher();
    for (const data of dataList) {
      console.info("import data", {
        class: className,
        properties: data,
        id: generateUuid5(data[keyId]),
      })
      batcherId = batcherId.withObject({
        class: className,
        properties: data,
        id: generateUuid5(data[keyId]),
      });
    }

    await batcherId.do();
  }

  hasResults() {
    return this.results?.data?.Get?.Images?.length > 0;
  }

  getResults() {
    return this.results?.data.Get
  }
}

const acceptIstockCookie = async (page: any) => {
  const acceptCookiesButton = await page.$('button:has-text("Accept All Cookies")');
  if (acceptCookiesButton) {
    await acceptCookiesButton.click();
  }
}

const clickDownloadConsent = async (page: any) => {
  const consentButton = await page.$('button:has-text("Consent")');
  if (consentButton) {
    await consentButton.click();
  }
}

const getIStockData = async (page: any) => {
  const data: any = []
  const articleLinks = await page.$$('article a');

  for (const link of articleLinks) {
    const linkHref = await link.getAttribute('href');
    const image = await link.$('img');
    const imageSrc = await image.getAttribute('src');
    const imageAlt = await image.getAttribute('alt');

    data.push({
      href: `https://www.istockphoto.com${linkHref}`,
      src: imageSrc,
      alt: imageAlt,
    });
  }

  return data;
}

export const findImage = async (keyword: string) => {
  try {
    // console.info("init vector", { keyword });
    const vector = new Vector();

    // await vector.addSchema("Images")
    // spawnSync("npx", ["playwright", "install", "chromium"]);
    const browser = await chromium.launch({ headless: true });

    // Create a new page
    const context = await browser.newContext()
    const page = await context.newPage()

    await page.goto(`https://www.istockphoto.com/search/2/image-film\?istockcollection\=signature%2Csignatureplus\&orientations\=square%2Chorizontal%2Cpanoramichorizontal\&phrase\=${keyword}`);

    await acceptIstockCookie(page);

    const istockData = await getIStockData(page);
    console.log("istockData", istockData.slice(0, 5))

    await vector.importData("Images", "href", istockData)
    //   {
    //     "data": {
    //         "Get": {
    //             "Images": [
    //                 {
    //                     "href": "",
    //                     "src": "",
    //                     "alt": ""
    //                 },
    //             ]
    //         }
    //     }
    // }
    await vector.query({
      className: "Images",
      fields: "href src alt",
      keywords: [keyword],
      limit: 10
    });

    if (!vector.hasResults()) {
      console.log("No results/match")
      await browser.close();
      return;
    }

    const selectedImage = vector.getResults()?.Images?.[0]
    // const selectedImage = istockData[random(15)]
    console.log("selectedImage.href", selectedImage.href);

    await page.goto('https://downloader.la/istockphoto-downloader.html');
    await clickDownloadConsent(page);
    // Type "intermittent fasting" in the input field with the selector #codecyan-download-link
    await page.type('#codecyan-download-link', selectedImage.href);
    // Click on the button with the selector #codecyan-download-btn-default
    await page.click('#codecyan-download-btn-default');
    // Wait for the element with the selector #codecyan-success to appear
    await page.waitForSelector('#codecyan-success', {
      timeout: 60 * 1000
    });
    // Get the href of the link within the element with the selector #codecyan-success > a
    const hrefValue = await page.$eval('#codecyan-success > a', (a: any) => a.href);
    await page.goto(hrefValue);
    // Wait for the element with the selector #previewUrl to appear
    await page.waitForSelector('#previewUrl');
    // Get the href of the element with the selector #previewUrl
    const previewUrlValue = await page.$eval('#previewUrl', (a: any) => a.href);
    // Log the href value of #previewUrl to the console
    console.log('Preview URL:', previewUrlValue);
    await browser.close();
    return {
      href: previewUrlValue,
      alt: selectedImage.alt
    }
  } catch (e) {
    console.error(chalk.bgRed("[ERROR]: find image"), e);
    console.log("istockDownloaderHelper error")
    return;
  }
}

export const getBlogUrls = (xmlData: string) => {
  // TODO: the host must be dynamic
  // Regular expression pattern to match URLs starting with "https://getfiit.app/blog"
  const regex = /<loc>(https:\/\/getfiit\.app\/blog\/.*?)<\/loc>/g;

  // Initialize an array to store blog URLs
  const blogUrls = [];

  // Match URLs using the regular expression
  let match;
  while ((match = regex.exec(xmlData)) !== null) {
    blogUrls.push(match[1]);
  }

  return blogUrls;
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
    article,
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
      depth: 50,
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
    videos: isEmpty(data.tasks[0].result) || isEmpty(data.tasks[0].result[0]?.items) ? [] : data.tasks[0].result[0].items.map((i) => ({
      title: i.title,
      url: i.url,
      description: i.description,
      breadcrumb: i.breadcrumb,
      website_name: i.website_name,
    })),
  }
}