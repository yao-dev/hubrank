import { NextResponse } from "next/server";
import { AI } from "../../AI";
import { getSummary } from 'readability-cyr';
import {
  checkCredits,
  cleanArticle,
  convertMarkdownToHTML,
  deductCredits,
  fetchSitemapXml,
  getAndSaveSchemaMarkup,
  getSitemapUrls,
  getHeadlines,
  getKeywordsForKeywords,
  getProjectContext,
  getProjectKnowledges,
  getRelevantKeywords,
  getRelevantUrls,
  getWritingStyle,
  getYoutubeVideosForKeyword,
  insertBlogPost,
  markArticleAsFailure,
  markArticleAsReadyToView,
  updateBlogPost,
  updateBlogPostStatus,
  writeHook,
  writeSection,
} from "../../helpers";
import chalk from "chalk";
import { supabaseAdmin } from "@/helpers/supabase";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");
export const maxDuration = 300;

export async function POST(request: Request) {
  const start = performance.now();
  let articleId;

  try {
    const body = await request.json();

    // CHECK IF USER HAS ENOUGH CREDITS
    const creditCheck = {
      userId: body.userId,
      costInCredits: 1 + (body.structured_schemas.length * 0.5),
      featureName: "write"
    }
    await checkCredits(creditCheck);

    // CREATE NEW ARTICLE WITH QUEUE STATUS
    articleId = await insertBlogPost(body)

    // CHANGE STATUS TO WRITING
    await updateBlogPostStatus(articleId, "writing")

    const [
      { data: project },
      { data: language },
    ] = await Promise.all([
      supabase.from("projects").select("*").eq("id", body.project_id).single(),
      supabase.from("languages").select("*").eq("id", body.language_id).single()
    ]);

    const context = getProjectContext({
      name: project.name,
      website: project.website,
      description: project.metatags?.description || project?.description,
      lang: language.label,
    })

    // FETCH WRITING STYLE IF IT EXISTS
    let writingStyle;
    if (body.writing_style_id) {
      writingStyle = await getWritingStyle(body.writing_style_id)
    }

    if (body.title_mode === "custom") {
      body.title = body.custom_title;
    } else {
      const headlines = await getHeadlines({
        language,
        context,
        writingStyle,
        seedKeyword: body.seed_keyword,
        purpose: body.purpose,
        tone: body.tones,
        contentType: body.content_type,
        clickbait: body.clickbait,
        isInspo: body.title_mode === "inspo",
        inspoTitle: body.title_mode === "inspo" && body.inspo_title,
        count: 1
      });

      body.title = headlines?.[0];

      // CHANGE STATUS TO WRITING
      await updateBlogPost(articleId, { title: body.title })
    }

    const ai = new AI({ context, writing_style: writingStyle });

    let sitemaps: string[];

    // FETCH THE SITEMAP
    if (body.sitemap) {
      const sitemapXml = await fetchSitemapXml(body.sitemap);
      console.log(chalk.yellow(sitemapXml));
      sitemaps = getSitemapUrls({ websiteUrl: project.website, sitemapXml });
      sitemaps = await getRelevantUrls({
        query: body.title,
        urls: sitemaps,
        userId: body.userId,
        articleId,
        topK: 10
      });
    }

    // TODO: get keywords ideas with search intent based on body.seed_keyword using AI
    // get a string[] of keywords

    const { keywords: kw } = await getKeywordsForKeywords({
      keyword: body.seed_keyword,
      countryCode: language.code
    })
    const keywords = await getRelevantKeywords({
      keywords: kw,
      userId: body.userId,
      articleId,
      query: body.title,
      topK: 30
    })
    await updateBlogPost(articleId, { keywords })
    const { videos } = await getYoutubeVideosForKeyword({
      keyword: body.title,
      languageCode: language.code,
      locationCode: language.location_code,
    });

    // GET THE WORD COUNT OF EACH SECTION OF THE OUTLINE
    const outlinePlan = await ai.outlinePlan({
      ...body,
      language: language.label,
      sitemaps,
      images: body.sectionImages,
      videos,
      keywords
    });

    // GET HEADINGS AS A COMMA SEPARATED STRING
    const outline = outlinePlan.table_of_content_markdown

    console.log(chalk.bgMagenta(JSON.stringify(outlinePlan, null, 2)));

    // WRITE META DESCRIPTION
    const { description: metaDescription } = await ai.metaDescription({ ...body, outline });

    // UPDATE WRITE COST
    // await saveWritingCost({ articleId, cost: ai.cost });

    // ADD H1 TITLE TO THE ARTICLE
    ai.article = `# ${body.title}\n`;

    // if (body.featuredImage) {
    //   ai.article += `![${body.featuredImage.alt ?? ""}](${body.featuredImage.href})\n`
    // }

    // let featuredImage = ""
    // if (body.with_featured_image) {
    //   // try {
    //   //   const featured_image = await findImage(body.title);
    //   //   if (featured_image && featured_image.alt && featured_image.href) {
    //   //     ai.article += `![${featured_image.alt}](${featured_image.href})\n`;
    //   //     featuredImage = featured_image.href;
    //   //   }
    //   // } catch (e) {
    //   //   const unplashImg = await getImage("unsplash", body.title);
    //   //   if (unplashImg) {
    //   //     ai.article += `![${unplashImg.alt}](${unplashImg.href})\n`;
    //   //     featuredImage = unplashImg.href;
    //   //   }
    //   // }
    //   if (!featuredImage) {
    //     const unplashImg = await getImage("unsplash", body.seed_keyword);
    //     if (unplashImg) {
    //       ai.article += `![${unplashImg.alt}](${unplashImg.href})\n`;
    //       featuredImage = unplashImg.href;
    //     }
    //   }
    // }

    if (body.with_hook) {
      await writeHook({
        ai,
        title: body.title,
        outline,
        seed_keyword: body.seed_keyword,
        keywords, // TODO: make use of it in ai.hook
        // perspective: body.perspective,
        // tones: body.tones,
        // purpose: body.purpose,
        purposes: body.purposes,
        emotions: body.emotions,
        vocabularies: body.vocabularies,
        sentence_structures: body.sentence_structures,
        perspectives: body.perspectives,
        writing_structures: body.writing_structures,
        instructional_elements: body.instructional_elements,
        article_id: articleId
      })
    }

    ai.article = [
      ai.article,
      outlinePlan.table_of_content_markdown,
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
      //   // TODO: fetch image
      //   // try {
      //   //   image = await findImage(section.image_search)
      //   //   if (!image?.href) {
      //   //     image = await getImage("unsplash", section.image_search)
      //   //   }
      //   // } catch (e) {
      //   //   if (!image?.href) {
      //   //     image = await getImage("unsplash", section.image_search)
      //   //   }
      //   // }
      //   image = await getImage("unsplash", shuffle(get(section, "keywords", "").split(","))[0])
      // }

      let youtubeVideo;
      // if (section.media === "youtube" && section.youtube_search) {
      //   // TODO: fetch video
      // }

      // TODO: add knowledges in writeSection prompt
      const knowledges = await getProjectKnowledges({
        userId: body.userId,
        projectId: body.project_id,
        topK: 5,
        query: `${section.name} ${section?.keywords ?? ""}`
      })

      // WRITE EACH SECTION
      await writeSection({
        ai,
        index,
        section: {
          prefix: "##",
          keywords: section?.keywords ?? "",
          word_count: section?.word_count ?? 250,
          name: section.name,
          call_to_action: section?.call_to_action,
          call_to_action_example: section?.call_to_action_example,
          custom_prompt: section?.custom_prompt,
          perspective: body.perspective,
          tones: body.tones,
          purpose: body.purpose,
          image,
          youtube_video: youtubeVideo,
          internal_links: section?.internal_links,
          images: section?.images,
          video_url: section?.video_url,
        },
        outline,
        title: body.title,
        articleId,
      })
    }

    // REMOVE UNWANTED CHARACTERS
    ai.article = cleanArticle(ai.article);

    // try {
    //   const { data: project } = await getProjectById(body.project_id);

    //   if (project) {
    //     const structuredDataNames = await ai.structuredDataNames({
    //       article: ai.article
    //     })
    //     console.log(chalk.yellow(JSON.stringify(structuredDataNames, null, 2)));

    //     const schemas = [];

    //     for (let schemaName of structuredDataNames) {
    //       const structuredData = await ai.structuredData({
    //         project,
    //         article: ai.article,
    //         schemaName
    //       });

    //       console.log(chalk.yellow(JSON.stringify(structuredData, null, 2)));
    //       schemas.push(structuredData)
    //     }

    //     // SAVE ALL STRUCTURED DATA
    //     await saveStructuredData(articleId, schemas)
    //   }
    // } catch (e) {
    //   console.error(chalk.bgRed("[ERROR] generating structured data:", e));
    // }

    // ADD ARTICLE METADATA COMMENT
    // ai.article = `
    // ---
    // title: ${body.title}
    // description: ${outlinePlan.meta_description}
    // image: ${featuredImage}
    // keywords: ${body.keywords}
    // date: ${format(new Date() "yyyy-MM-dd")}
    // modified: ${format(new Date() "yyyy-MM-dd")}
    // ---

    // ${ai.article}
    // `

    console.log("full article", chalk.blueBright(ai.article));

    // CONVERT MARKDOWN ARTICLE TO HTML
    const html = convertMarkdownToHTML(ai.article);
    console.log("html", chalk.redBright(ai.article));

    // END PERFORMANCE CALCULATION
    const end = performance.now();
    const writingTimeInSeconds = (end - start) / 1000;

    // GET ARTICLE STATS
    const articleStats = getSummary(ai.article);

    await getAndSaveSchemaMarkup({
      project,
      articleId,
      cleanedArticle: ai.article,
      lang: language.label,
      structuredSchemas: body.structured_schemas
    });

    // DEDUCTS CREDITS FROM USER SUBSCRIPTION
    await deductCredits(creditCheck);

    // UPDATE ARTICLE STATUS TO READY TO VIEW
    await markArticleAsReadyToView({
      markdown: ai.article,
      cost: ai.cost,
      html,
      writingTimeInSeconds,
      articleId,
      wordCount: articleStats.words,
      featuredImage: body.featuredImage?.href ?? "",
      metaDescription,
    });

    return NextResponse.json({
      markdown: ai.article,
      html,
      writingTimeInSeconds,
      stats: articleStats,
      featuredImage: body.featuredImage?.href ?? "",
      metaDescription,
    }, { status: 200 });
  } catch (error) {
    await markArticleAsFailure({ articleId, error })
    return NextResponse.json(error, { status: 500 });
  }
}