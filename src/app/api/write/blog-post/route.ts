import { NextResponse } from "next/server";
import { AI } from "../../AI";
import { getSummary } from 'readability-cyr';
import {
  cleanArticle,
  convertMarkdownToHTML,
  fetchSitemapXml,
  getAndSaveSchemaMarkup,
  getSitemapUrls,
  getYoutubeVideosForKeyword,
  markArticleAsFailure,
  markArticleAs,
  updateBlogPost,
  writeHook,
  writeSection,
  getYoutubeTranscript,
  getUrlOutline,
  updateBlogPostStatus,
} from "../../helpers";
import chalk from "chalk";
import { getKeywordsForKeywords, getSerp } from "@/helpers/seo";
import supabase from "@/helpers/supabase/server";

export const maxDuration = 300;

export async function POST(request: Request) {
  const start = performance.now();
  let articleId;

  try {
    const body = await request.json();
    const context = body.context;
    const writingStyle = body.writingStyle;
    const language = body.language;
    const project = body.project;
    articleId = body.articleId;

    // CHANGE STATUS TO WRITING
    await updateBlogPostStatus(articleId, "writing")

    const ai = new AI({ context, writing_style: writingStyle });

    const { keywords: kw } = await getKeywordsForKeywords({
      keyword: body.seed_keyword,
      countryCode: language.code
    })
    const keywords = await ai.getRelevantKeywords({
      title: body.title,
      seed_keyword: body.seed_keyword,
      keywords: kw.slice(0, 200),
      count: 20
    });

    console.log(`relevant keywords for: ${body.seed_keyword}`, keywords)

    await updateBlogPost(articleId, { keywords });

    let sitemaps: string[];

    // FETCH THE SITEMAP
    if (body.sitemap) {
      const sitemapXml = await fetchSitemapXml(body.sitemap);
      sitemaps = getSitemapUrls({ websiteUrl: project.website, sitemapXml });
      sitemaps = await ai.getRelevantUrls({
        title: body.title,
        seed_keyword: body.seed_keyword,
        urls: sitemaps,
        count: 10
      })
      console.log(`relevant urls for: ${body.seed_keyword}`, sitemaps)
    }

    let youtubeTranscript;
    if (body.title_mode === "youtube_to_blog" && body.youtube_url) {
      youtubeTranscript = await getYoutubeTranscript(body.youtube_url);
    }

    let videos = [];
    if (body.with_youtube_videos) {
      const { videos: youtubeVideos } = await getYoutubeVideosForKeyword({
        keyword: keywords.slice(0, 10).join(" OR ") || body.seed_keyword,
        languageCode: language.code,
        locationCode: language.location_code,
      });
      videos = youtubeVideos;
    }

    let competitors;

    if (!body.competitors) {
      competitors = await getSerp({
        query: body.seed_keyword,
        languageCode: language.code,
        locationCode: language.location_code,
        count: 15
      });
    }

    const competitorsOutline = [];

    for (let competitor of competitors) {
      const competitorOutline = await getUrlOutline(competitor.url);
      competitorsOutline.push(competitorOutline)
    }

    // GET THE WORD COUNT OF EACH SECTION OF THE OUTLINE
    const outlinePlan = await ai.outlinePlan({
      ...body,
      language: language.label,
      sitemaps,
      images: body.sectionImages,
      videos,
      keywords,
      youtube_transcript: youtubeTranscript,
      competitors_outline: competitorsOutline
    });

    // GET HEADINGS AS A COMMA SEPARATED STRING
    const outline = outlinePlan.table_of_content_markdown;

    console.log(chalk.bgMagenta(JSON.stringify(outlinePlan, null, 2)));

    // WRITE META DESCRIPTION
    const { description: metaDescription } = await ai.metaDescription({ ...body, keywords, outline });


    // SET FEATURED IMAGE
    let featuredImage = body.featured_image;
    if (body.featured_image) {
      ai.article += `![featured image](${body.featured_image})\n`
    } else {
      // const images = await getImages(keywords.join());
      // console.log(`unsplash images for keywords: ${keywords.join()}`, images)
      // const foundFeaturedImage = shuffle(images)[0];

      // if (foundFeaturedImage) {
      //   featuredImage = foundFeaturedImage.href;
      //   ai.article += `![${foundFeaturedImage.alt ?? ""}](${foundFeaturedImage.href})\n`
      // }
    }

    if (body.with_hook) {
      await writeHook({
        ai,
        title: body.title,
        outline,
        seed_keyword: body.seed_keyword,
        keywords,
      })
    }

    ai.article = [
      ai.article,
      outline,
      ""
    ].join('\n\n');

    for (const [index, section] of Object.entries(outlinePlan.sections) as any) {
      // TODO: section.media
      // TODO: section.external_source + section.instruction

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
      // const knowledges = await getProjectKnowledges({
      //   userId: body.userId,
      //   projectId: body.project_id,
      //   topK: 500,
      //   query: `${section.name} ${section?.keywords ?? ""}`,
      //   minScore: 0.5
      // });

      let external_links;

      if (section?.search_query) {
        const serp = await getSerp({ query: section.search_query, languageCode: language.code, locationCode: language.location_code, count: 20 });
        const serpUrls = serp.map((item) => item.url);
        external_links = await ai.getRelevantUrls({
          title: body.title,
          seed_keyword: section.name,
          urls: serpUrls,
          count: Math.min(serpUrls.length, 3)
        })
        console.log(`relevant external urls for section: ${section.name}`, serp)
      }

      // WRITE EACH SECTION
      await writeSection({
        ai,
        index,
        outline,
        title: body.title,
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

    // END PERFORMANCE CALCULATION
    const end = performance.now();
    const writingTimeInSeconds = (end - start) / 1000;

    await getAndSaveSchemaMarkup({
      project,
      articleId,
      article: {
        meta_description: metaDescription,
        text: ai.article
      },
      lang: language.label,
      structuredSchemas: body.structured_schemas,
    });

    // GET ARTICLE STATS
    const articleStats = getSummary(ai.article);

    const result = {
      markdown: ai.article,
      html,
      writingTimeInSeconds,
      articleId,
      wordCount: articleStats.words,
      featuredImage: featuredImage ?? "",
      metaDescription,
      status: 'ready_to_view'
    }

    if (body.auto_publish) {
      const { data: integrations } = await supabase().from("integrations").select("*").match({ user_id: body.userId, project_id: body.project_id, enabled: true });

      if (integrations && integrations?.length > 0) {
        // UPDATE ARTICLE STATUS TO PUBLISHING
        result.status = 'publishing'
      }
    }

    await markArticleAs(result);

    return NextResponse.json({
      markdown: ai.article,
      html,
      writingTimeInSeconds,
      stats: articleStats,
      featuredImage: featuredImage ?? "",
      metaDescription,
    }, { status: 200 });
  } catch (error) {
    await markArticleAsFailure({ articleId, error })
    return NextResponse.json(error, { status: 500 });
  }
}