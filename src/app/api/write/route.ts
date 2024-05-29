import { NextResponse } from "next/server";
import { AI } from "../AI";
import { getSummary } from 'readability-cyr';
import {
  cleanArticle,
  convertMarkdownToHTML,
  getBlogUrls,
  getProjectContext,
  getWritingStyle,
  insertBlogPost,
  markArticleAsFailure,
  markArticleAsReadyToView,
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

    if (body.title_mode === "programmatic_seo") {
      const variables = Object.keys(body).filter((key) => key.startsWith("variables-")).map((key) => {
        const variable = key.replace("variables-", "");
        return {
          description: body[key],
          variable,
          instruction: `Replace {${variable}} with ${body[key]}`
        }
      })
      const seoAI = new AI();
      const pSeoVariablesValue = await seoAI.getPSeoVariablesValue({
        ...body,
        variables
      })
      console.log(chalk.yellow(JSON.stringify(pSeoVariablesValue, null, 2)));
      const pSeoOutline = await seoAI.getPSeoOutline({
        content_type: body.content_type,
        headline: body.headline,
        word_count: body.word_count,
        variables: variables,
      });

      for (let variableValueSet of pSeoVariablesValue.slice(0, 2)) {
        let prompt = "Now write up to ${body.word_count} words using this template";

        prompt += body?.purposes?.length > 0 ? `\nPurposes: ${body?.purposes.join(', ')}` : "";
        prompt += body?.emotions?.length > 0 ? `\nEmotions: ${body?.emotions.join(', ')}` : "";
        prompt += body?.vocabularies?.length > 0 ? `\nVocabularies: ${body?.vocabularies.join(', ')}` : "";
        prompt += body?.sentence_structures?.length > 0 ? `\nSentence structures: ${body?.sentence_structures.join(', ')}` : "";
        prompt += body?.perspectives?.length > 0 ? `\nPerspectives: ${body?.perspectives.join(', ')}` : "";
        prompt += body?.writing_structures?.length > 0 ? `\nWriting_structures: ${body?.writing_structures.join(', ')}` : "";
        prompt += body?.instructional_elements?.length > 0 ? `\nInstructional elements: ${body?.instructional_elements.join(', ')}` : "";

        prompt += body.with_introduction ? "\n- add an introduction, it is no more than 100 words (it never has sub-sections)" : "\n- do not add an introduction"
        prompt += body.with_conclusion ? "\n- add a conclusion, it is no more than 200 words (it never has sub-sections)" : "\n- do not add a conclusion"
        prompt += body.with_key_takeways ? "\n- add a key takeways, it is a list of key points or short paragraph (it never has sub-sections)" : "\n- do not add a key takeways"
        prompt += body.with_faq ? "\n- add a FAQ" : "\n- do not add a FAQ";
        prompt += `\n- Language: ${body.language}`

        if (body.additional_information) {
          prompt += `\n${body.additional_information}`
        }

        // if (body.keywords?.length > 0) {
        //   prompt += `\n- List of keywords to include (avoid keywords stuffing): ${body.keywords}`
        // }

        if (body.sitemaps?.length > 0) {
          prompt += `\n- Sitemap (useful to include relevant links):\n${JSON.stringify(body.sitemaps, null, 2)}`
        }

        prompt += `\nOutline:\n${JSON.stringify(pSeoOutline, null, 2)}`;
        prompt += `\Variables:\n${JSON.stringify(pSeoOutline, null, 2)}`;

        const pSeoArticle = await seoAI.ask(`Now write up to ${body.word_count} words using this template

        Outline:
        ${JSON.stringify(pSeoOutline, null, 2)}

        Variables:
        ${variables.map((i) => {
          return `${i.variable} (replace with ${variableValueSet[i.variable]}): ${i.instruction}\n`
        })}

        Write in markdown wrapped in \`\`\`markdown\`\`\`.
        `, { type: "markdown", mode: "PSEO article", temperature: 0.5 })

        console.log(chalk.yellow(cleanArticle(pSeoArticle), null, 2));
      }
      return NextResponse.json({
        success: true
      }, { status: 200 });
    }

    console.log(chalk.yellow(JSON.stringify(body, null, 2)));

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
    ])

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
        keywords: body.keywords, // TODO: make use of it in ai.hook
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