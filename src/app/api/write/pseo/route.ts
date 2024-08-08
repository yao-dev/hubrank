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
  getProjectKnowledges,
  markArticleAsReadyToView,
  updateBlogPost,
  updateBlogPostStatus,
  markArticleAsFailure,
  writeHook,
  writeSection,
} from "../../helpers";
import { NextResponse } from "next/server";
import { getSummary } from 'readability-cyr';
import { supabaseAdmin } from "@/helpers/supabase";
import { getImages } from "@/helpers/image";
import { shuffle } from "lodash";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");
export const maxDuration = 180;

export async function POST(request: Request) {
  const body = await request.json();
  const context = body.context;
  const writingStyle = body.writingStyle;
  const language = body.language;
  const project = body.project;
  const articleId = body.articleId;

  try {
    // CHANGE STATUS TO WRITING
    await updateBlogPostStatus(articleId, "writing");

    const ai = new AI({ context, writing_style: writingStyle });

    const seedKeyword = body.variables[body.seed_keyword]

    const { keywords: kw } = await getKeywordsForKeywords({
      keyword: seedKeyword,
      countryCode: language.code
    })
    const keywords = await ai.getRelevantKeywords({
      title: body.title,
      seed_keyword: seedKeyword,
      keywords: kw.slice(0, 200),
      count: 20
    });

    console.log(`relevant keywords for: ${seedKeyword}`, keywords)

    await updateBlogPost(articleId, { keywords })

    let sitemaps: string[];

    // FETCH THE SITEMAP
    if (body.sitemap) {
      const sitemapXml = await fetchSitemapXml(body.sitemap);
      console.log(chalk.yellow(sitemapXml));
      sitemaps = getSitemapUrls({ websiteUrl: project.website, sitemapXml });
      sitemaps = await ai.getRelevantUrls({
        title: body.title,
        seed_keyword: seedKeyword,
        urls: sitemaps,
        count: 10
      })
      console.log(`relevant urls for: ${seedKeyword}`, sitemaps)
    }

    // let videos = [];
    // if (body.with_youtube_videos) {
    //   const { videos: youtubeVideos } = await getYoutubeVideosForKeyword({
    //     keyword: keywords.slice(0, 10).join(" OR ") || seedKeyword,
    //     languageCode: language.code,
    //     locationCode: language.location_code,
    //   });
    //   videos = youtubeVideos;
    // }

    let outline = body.outline.table_of_content_markdown;

    // Interpolate variables
    Object.entries(body.variables).forEach(([variable, value]) => {
      console.log(`[${variable}, ${value}]`)
      outline = outline.replaceAll(`{${variable}}`, value);
    })

    console.log("outline interpolation", outline)

    // WRITE META DESCRIPTION
    const { description: metaDescription } = await ai.metaDescription({
      ...body,
      keywords,
      outline
    });

    // SET FEATURED IMAGE
    const images = await getImages(keywords.join());
    console.log("unsplash images", images)
    const featuredImage = shuffle(images)[0];

    if (featuredImage) {
      ai.article = `![${featuredImage.alt ?? ""}](${featuredImage.href})\n`
    }

    // WRITE HOOK
    if (body.with_hook) {
      await writeHook({
        ai,
        title: body.title,
        outline,
        seed_keyword: seedKeyword,
        keywords,
      })
    }

    ai.article = [
      ai.article,
      outline,
      ""
    ].join('\n\n');

    for (const [index, section] of Object.entries(body.outline.sections) as any) {
      if (!section) {
        throw new Error(`No section found for index: ${index}`)
      }
      let image;
      // if (section.media === "image") {
      //   image = await getImage("unsplash", shuffle(get(section, "keywords", "").split(","))[0])
      // }
      // if (section.image) {
      //   const images = await getImages(get(section, "keywords", ""));
      //   console.log("unsplash images", images)
      //   image = shuffle(images)[0]
      // }

      // TODO: add knowledges in writeSection prompt
      const knowledges = await getProjectKnowledges({
        userId: body.userId,
        projectId: body.project_id,
        topK: 500,
        query: `${section.name} ${section?.keywords ?? ""}`,
        minScore: 0.5
      })

      // prompt += `\nHeadline structure: ${body.title_structure}`;
      // prompt += `\nHeadline (do not add it in the output): ${body.title}`;
      // prompt += `\nReplace all variables with their respective value.`;

      // WRITE EACH SECTION
      await writeSection({
        pseo: true,
        ai,
        index,
        outline,
        title: body.title,
        title_structure: body.title_structure,
        variables: body.variables,
        section: {
          prefix: "##",
          keywords: section?.keywords ?? "",
          word_count: section?.word_count ?? 250,
          name: section.name,
          call_to_action: section?.call_to_action,
          call_to_action_example: section?.call_to_action_example,
          custom_prompt: section?.custom_prompt,
          image,
          internal_links: section?.internal_links,
          images: section?.images,
          video_url: section?.video_url,
          tones: section?.tones,
          purposes: section?.purposes,
          emotions: section?.emotions,
          vocabularies: section?.vocabularies,
          sentence_structures: section?.sentence_structures,
          perspectives: section?.perspectives,
          writing_structures: section?.writing_structures,
          instructional_elements: section?.instructional_elements,
        },
      })
    }

    // REMOVE UNWANTED CHARACTERS
    ai.article = cleanArticle(ai.article);
    console.log("full article markdown", chalk.blueBright(ai.article));

    // CONVERT MARKDOWN ARTICLE TO HTML
    const html = convertMarkdownToHTML(ai.article);
    console.log("html", chalk.redBright(html));

    await getAndSaveSchemaMarkup({
      project,
      article: {
        meta_description: metaDescription,
        text: ai.article
      },
      lang: language.label,
      structuredSchemas: body.structured_schemas
    })

    // DEDUCTS CREDITS FROM USER SUBSCRIPTION
    const cost = 1 + (body.structured_schemas.length * 0.25);
    const creditCheck = {
      userId: body.userId,
      costInCredits: cost,
      featureName: "pseo/write"
    }
    await deductCredits(creditCheck);

    // GET ARTICLE STATS
    const articleStats = getSummary(ai.article);

    await markArticleAsReadyToView({
      markdown: ai.article,
      html,
      articleId: articleId,
      wordCount: articleStats.words,
      featuredImage: featuredImage?.href ?? "",
      metaDescription,
      cost
    });

    return NextResponse.json({
      markdown: ai.article,
      html,
      stats: articleStats,
      featuredImage: featuredImage ?? "",
      metaDescription,
      cost
    }, { status: 200 });
  } catch (error) {
    await markArticleAsFailure({ articleId, error })
    return NextResponse.json(error, { status: 500 });
  }
}