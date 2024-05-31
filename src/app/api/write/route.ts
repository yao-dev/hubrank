import { NextResponse } from "next/server";
import { AI } from "../AI";
import { getSummary } from 'readability-cyr';
import {
  cleanArticle,
  convertMarkdownToHTML,
  getBlogUrls,
  getKeywordsForKeywords,
  getProjectContext,
  getSchemaMarkup,
  getWritingStyle,
  getYoutubeVideosForKeyword,
  insertBlogPost,
  markArticleAsFailure,
  markArticleAsReadyToView,
  saveSchemaMarkups,
  updateBlogPostStatus,
  writeHook,
  writeSection,
} from "../helpers";
import chalk from "chalk";
import axios from "axios";
import { supabaseAdmin } from "@/helpers/supabase";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");
export const maxDuration = 300;

export async function POST(request: Request) {
  const start = performance.now();
  let articleId;

  try {
    const body = await request.json();

    if (body.title_mode === "custom") {
      body.title = body.custom_title;
    }

    console.log(chalk.yellow(JSON.stringify(body, null, 2)));

    // CREATE NEW ARTICLE WITH QUEUE STATUS
    articleId = await insertBlogPost(body)

    // CHANGE STATUS TO WRITING
    await updateBlogPostStatus(articleId, "writing")

    const [
      { data: project },
      { data: pendingArticle },
      { data: language },
    ] = await Promise.all([
      supabase.from("projects").select("*").eq("id", body.project_id).single(),
      supabase.from("blog_posts").select("*").eq("id", body.articleId).maybeSingle(),
      supabase.from("languages").select("*").eq("id", body.language_id).single()
    ]);

    const { keywords } = await getKeywordsForKeywords({
      keyword: body.title, // TODO: won't work for provided title
      countryCode: language.code
    })
    const { videos } = await getYoutubeVideosForKeyword({
      keyword: body.title, // TODO: won't work for provided title
      languageCode: language.code,
      locationCode: language.location_code,
    });

    const context = getProjectContext({
      name: project.name,
      website: project.website,
      description: project.metatags?.description || project?.description,
      lang: language.label,
    })

    // FETCH WRITING STYLE IF IT EXISTS
    const writingStyle = await getWritingStyle(body.writing_style_id)
    const ai = new AI({ context, writing_style: writingStyle });

    let sitemaps

    // FETCH THE SITEMAP
    if (body.sitemap) {
      const { data: sitemapXml } = await axios.get(body.sitemap);
      console.log(chalk.yellow(sitemapXml));
      sitemaps = getBlogUrls(sitemapXml)
    }

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

    const schemas = pendingArticle.schema_markups ?? [];

    for (let schema of body.structured_schemas) {
      const createdSchema = await getSchemaMarkup({
        project,
        article: ai.article,
        lang: language.label,
        schemaName: schema,
      })
      schemas.push(createdSchema)
      console.log("schemas", schemas)
      await saveSchemaMarkups(articleId, schemas);
    }

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

// export async function POST(request: Request) {
//   const start = performance.now();
//   const body = await request.json();

//   let articleId;

//   try {
//     const { data: queuedArticle } = await supabase.from("blog_posts")
//       .insert({
//         title: body.title,
//         seed_keyword: body.seed_keyword,
//         status: "queue",
//         keywords: body.keywords,
//         user_id: body.userId,
//         project_id: body.project_id,
//         language_id: body.language_id,
//         title_mode: body.title_mode,
//         content_type: body.content_type,
//         purpose: body.purpose,
//         tones: body.tones,
//         perspective: body.perspective,
//         clickbait: body.clickbait,
//         sitemap: body.sitemap,
//         external_sources: body.external_sources,
//         external_sources_objective: body.external_sources_objective,
//         with_featured_image: body.with_featured_image,
//         with_table_of_content: body.with_table_of_content,
//         with_sections_image: body.with_sections_image,
//         with_sections_image_mode: body.with_sections_image_mode,
//         image_source: body.image_source,
//         with_seo: body.with_seo,
//         writing_mode: body.writing_mode,
//         writing_style_id: body.writing_style_id,
//         additional_information: body.additional_information,
//         word_count: body.word_count,
//         with_hook: body.with_hook,
//         outline: body.outline,
//       })
//       .select("id")
//       .single()
//       .throwOnError();

//     console.log("queuedArticle", queuedArticle)

//     articleId = queuedArticle?.id;

//     await supabase
//       .from('blog_posts')
//       .update({ status: "writing" })
//       .eq("id", articleId)
//       .throwOnError();

//     let writing_style = "";

//     if (body.writing_style_id) {
//       const { data: writingStyle } = await supabase.from("writing_styles").select("text").eq("id", body.writing_style_id).limit(1).single();
//       writing_style = writingStyle?.text ?? ""
//     }

//     const ai = new AI({ writing_style });
//     const wordsCount = await ai.sectionsWordCount(body)
//     const outline = body.outline.join(', ');

//     ai.article = `# ${body.title}\n`;

//     if (body.with_hook) {
//       console.log(`[start]: hook`)
//       let hook = await ai.hook({
//         title: body.title,
//         outline,
//         seed_keyword: body.seed_keyword,
//         keywords: body.keywords,
//         perspective: body.perspective,
//       });

//       let stats = getSummary(hook)

//       // if (stats.difficultWords >= 5 || stats.FleschKincaidGrade > 9) {
//       if (stats.FleschKincaidGrade > 12) {
//         console.log("- rephrase")
//         hook = await ai.rephrase(ai.parse(hook, "markdown"));
//         console.log("- rephrase done")
//       }

//       console.log("- add hook to article")
//       ai.addArticleContent(ai.parse(hook, "markdown"));
//       console.log(`[end]: hook`)
//     }

//     for (const [index, heading] of Object.entries(body.outline)) {
//       console.log(`[start]: ${index}) ${heading}`)
//       let content = await ai.write({
//         heading_prefix: "##",
//         title: body.title,
//         heading,
//         // word_count: section.sub_sections ? sectionWithSubWordCount : section.word_count,
//         word_count: wordsCount[index].word_count,
//         outline,
//         perspective: body.perspective,
//         keywords: wordsCount[index].keywords,
//       });

//       let stats = getSummary(content);

//       // if (stats.difficultWords >= 5 || stats.FleschKincaidGrade > 9) {
//       if (stats.FleschKincaidGrade > 12) {
//         console.log("- rephrase")
//         content = await ai.rephrase(ai.parse(content, "markdown"));
//         console.log("- rephrase done")
//       }

//       console.log("- add section to article")
//       ai.addArticleContent(ai.parse(content, "markdown"));
//       console.log(`[end]: ${index}) ${heading}`)
//     }

//     ai.article = ai.article.replaceAll("```markdown", "").replaceAll("```", "")

//     console.log("parse markdown to html")
//     const html = marked.parse(ai.article);
//     console.log("parse markdown to html done")

//     const end = performance.now();
//     const writingTimeInSeconds = (end - start) / 1000;
//     console.log("writing time in seconds", writingTimeInSeconds)

//     await supabase
//       .from('blog_posts')
//       .update({
//         markdown: ai.article,
//         html,
//         status: 'ready_to_view',
//         // meta_description: result?.meta_description,
//         writing_time_sec: writingTimeInSeconds,
//         word_count: getSummary(ai.article).words
//       })
//       .eq("id", articleId)
//       .throwOnError();

//     console.log("ERROR IN TRY?")

//     return NextResponse.json({
//       markdown: ai.article,
//       html,
//       writingTimeInSeconds,
//       stats: getSummary(ai.article)
//     }, { status: 200 })
//   } catch (e) {
//     console.log("ERROR IN CATCH?", e)
//     await supabase
//       .from('blog_posts')
//       .update({
//         status: 'error',
//         error: JSON.stringify(e)
//       })
//       .eq("id", articleId)
//       .throwOnError();

//     return NextResponse.json(e, { status: 500 })
//   }
// }