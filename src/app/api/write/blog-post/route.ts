import { NextResponse } from "next/server";
import { AI } from "../../AI";
import { getSummary } from 'readability-cyr';
import {
  convertMarkdownToHTML,
  fetchSitemapXml,
  getAndSaveSchemaMarkup,
  getSitemapUrls,
  markArticleAsFailure,
  markArticleAs,
  updateBlogPost,
  getYoutubeTranscript,
  getUrlOutline,
  updateBlogPostStatus,
  queryInstantVector,
  getTableOfContent,
  getOutlineSchema,
  getOutlinePrompt,
  getMetaDescriptionSchema,
  getMetaDescriptionPrompt,
  getHookSchema,
  getHookPrompt,
  getSectionPrompt,
  getAllUrlsFromAnyData,
  getRelevantUrlsSchema,
  getRelevantUrlsPrompt,
  getRelevantYoutubeVideoPrompt,
  getRelevantYoutubeVideoSchema,
  removeMarkdownWrapper,
  urlToVector,
  deleteNamespace,
  queryVector,
  getErrorMessage,
  deductCredits,
  getRephraseInstruction,
} from "../../helpers";
import chalk from "chalk";
import { getKeywordsForKeywords, getSerp } from "@/helpers/seo";
import { compact, shuffle } from "lodash";
import { getAiImage, getImages } from "@/helpers/image";
import { searchYouTubeVideos } from "@/app/app/actions";
import { generateObject, generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { avoidWords, imageStyles } from "@/options";
import { v4 as uuid } from "uuid";
import { createAnthropic } from '@ai-sdk/anthropic';
import OpenAI from "openai";

const anthropic = createAnthropic({
  baseURL: "https://api.anthropic.com/v1",
  // baseURL: "https://anthropic.hconeai.com/",
  apiKey: process.env.ANTHROPIC_API_KEY,
  // headers: {
  //   "Helicone-Auth": `Bearer ${process.env.HELICONE_AUTH}`,
  // },
});

export const maxDuration = 300;

export async function POST(request: Request) {
  const start = performance.now();
  let articleId;
  const finalResult: {
    headline: string;
    outline: string;
    hook: string;
    meta_description: string;
    featured_image: string;
    sections: string[];
  } = {
    headline: "",
    outline: "",
    hook: "",
    meta_description: "",
    featured_image: "",
    sections: []
  };

  try {
    const body = await request.json();
    finalResult.headline = body.title;
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


    const getSitemap = async () => {
      try {
        let sitemap: string[] = [];

        // FETCH THE SITEMAP
        if (body.sitemap) {
          const sitemapXml = await fetchSitemapXml(body.sitemap);
          sitemap = getSitemapUrls({ websiteUrl: project.website, sitemapXml });
          sitemap = await ai.getRelevantUrls({
            title: body.title,
            seed_keyword: body.seed_keyword,
            urls: shuffle(sitemap).slice(0, 200),
            count: Math.floor(Math.random() * (15 - 3 + 1)) + 3, // random integer between 3 and 15
          })
          console.log(`relevant urls for: ${body.seed_keyword}`, sitemap)
        }

        return sitemap;
      } catch (e) {
        console.log("getSitemap error", getErrorMessage(e))
        return []
      }
    }

    const getYoutubeToBlogTranscript = async () => {
      let youtubeTranscript;
      try {
        if (body.title_mode === "youtube_to_blog" && body.youtube_url) {
          youtubeTranscript = await getYoutubeTranscript(body.youtube_url);
        }
        return youtubeTranscript;
      } catch (e) {
        console.log("getYoutubeToBlogTranscript error", getErrorMessage(e))
        return youtubeTranscript
      }
    }

    const getCompetitors = async () => {
      let competitors = body.competitors;

      try {
        if (!competitors) {
          console.log("=== GET SERP ===")
          competitors = await getSerp({
            query: body.seed_keyword,
            languageCode: language.code,
            locationCode: language.location_code,
            count: 15
          });
        }

        return competitors
      } catch (e) {
        console.log("getCompetitors error", getErrorMessage(e))
        return competitors
      }
    }

    const [sitemaps, youtubeTranscript, competitors] = await Promise.all([
      getSitemap(),
      getYoutubeToBlogTranscript(),
      getCompetitors()
    ])

    let competitorsOutline = [];
    competitorsOutline = await Promise.all(competitors.map(async (competitor) => {
      try {
        console.log("=== GET COMPETITOR OUTLINE ===")
        return await getUrlOutline(competitor.url);
      } catch (error) {
        console.error(`Failed to get outline for competitor URL: ${competitor.url}`, getErrorMessage(error));
        return null;
      }
    }));

    console.log("=== GET OUTLINE PLAN ===")
    const { object: outlinePlan } = await generateObject({
      output: "object",
      model: openai("gpt-4o"),
      schemaName: "table_of_content",
      schema: getOutlineSchema({ with_sections_image: body.with_sections_image, with_youtube_videos: body.with_youtube_videos }),
      prompt: getOutlinePrompt({
        ...body,
        language: language.label,
        sitemaps,
        youtube_transcript: youtubeTranscript,
        competitors_outline: competitorsOutline
      }),
      temperature: 0.5,
    });

    // GET HEADINGS AS A COMMA SEPARATED STRING
    const outline = outlinePlan.table_of_content_markdown;
    finalResult.outline = outline;

    console.log("OUTLINE ===", chalk.bgMagenta(JSON.stringify(outlinePlan, null, 2)));

    const handleMetaDescription = async () => {
      try {
        // WRITE META DESCRIPTION
        const { object: metaDescription } = await generateObject({
          output: "object",
          model: openai("gpt-4o"),
          schemaName: "article_description",
          schema: getMetaDescriptionSchema(),
          prompt: getMetaDescriptionPrompt({ ...body, keywords, outline }),
          temperature: 0.7,
        });

        finalResult.meta_description = metaDescription.description;
        return finalResult.meta_description
      } catch (e) {
        console.log("handleMetaDescription error", getErrorMessage(e))
        return ""
      }
    }
    const handleHook = async () => {
      try {
        if (body.with_hook) {
          const { object: hook } = await generateObject({
            output: "object",
            model: openai("gpt-4o"),
            schemaName: "article_hook",
            schema: getHookSchema(),
            prompt: getHookPrompt({
              headline: body.title,
              outline,
              seed_keyword: body.seed_keyword,
              keywords,
            }),
            temperature: 0,
          });

          finalResult.hook = hook.markdown
        }
      } catch (e) {
        console.log("handleHook error", getErrorMessage(e))
      }
    }

    const [metaDescription] = await Promise.all([
      handleMetaDescription(),
      handleHook()
    ])


    // SET FEATURED IMAGE
    let featuredImage = body.featured_image;
    finalResult.featured_image = featuredImage

    if (body.with_featured_image) {
      console.log("We search for a suitable featured image");
      const keywordsSubset = keywords.slice(0, 10)
      let keywordImages = await Promise.all(keywordsSubset.map(
        async (keyword: string) => {
          try {
            const images = await getImages(keyword, 10);
            return images;
          } catch (e) {
            console.log("getImages for featured image error", getErrorMessage(e))
            return []
          }
        }
      ));
      keywordImages = keywordImages.flat();

      console.log("keywords image sample", keywordImages[0])

      const bestImage = await queryInstantVector({
        query: `${body.title} ${metaDescription}`,
        topK: 1,
        minScore: 0.8,
        docs: keywordImages.map((item) => ({
          query: item.alt,
          metadata: item
        }))
      });

      featuredImage = bestImage?.[0]?.metadata?.href || featuredImage;
      finalResult.featured_image = featuredImage
    }

    // if (body.featured_image) {
    //   ai.article += `![featured image](${body.featured_image})\n`
    // } else {
    //   // const images = await getImages(keywords.join());
    //   // console.log(`unsplash images for keywords: ${keywords.join()}`, images)
    //   // const foundFeaturedImage = shuffle(images)[0];

    //   // if (foundFeaturedImage) {
    //   //   featuredImage = foundFeaturedImage.href;
    //   //   ai.article += `![${foundFeaturedImage.alt ?? ""}](${foundFeaturedImage.href})\n`
    //   // }
    // }

    const writeSection = async ({ index, section }) => {
      if (!section) {
        throw new Error(`No section found for index: ${index}`)
      }

      // NOTE: disabling it for now as the images found are not really accurate compared to the content
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

      let image;
      let external_links;
      let external_resources;
      let selectedYoutubeVideo;
      const realTimeEnabled = true;

      async function generateImage() {
        try {
          if (section.image && section.image_description) {
            const generatedImage = await getAiImage({ query: section.image_description, image_style: imageStyles[3].name, articleId });
            image = generatedImage;
            console.log("ai image", image);
          }
        } catch (error) {
          console.error("Error generating AI image:", getErrorMessage(error));
        }
      }

      const getRealtimeData = async () => {
        try {
          if (section?.search_query && realTimeEnabled) {
            const serp = await getSerp({ query: section.search_query, languageCode: language.code, locationCode: language.location_code, count: 100, depth: 50 });

            const allLinksFoundInSerp = shuffle(getAllUrlsFromAnyData(serp)).slice(0, 5);
            console.log(`all links found in the serp for section: ${section.name} and query ${section.search_query}`, chalk.bgMagenta(JSON.stringify(allLinksFoundInSerp, null, 2)));

            let { object: relevantUrls } = await generateObject({
              output: "array",
              model: openai("gpt-4o"),
              temperature: 0.5,
              schemaName: "relevant_urls",
              schema: getRelevantUrlsSchema(),
              prompt: getRelevantUrlsPrompt({
                query: section.search_query,
                count: shuffle([1, 2, 3, 4])[0],
                urls: allLinksFoundInSerp
              }),
            });

            external_links = Array.from(new Set(relevantUrls));
            console.log(`links found in the serp matching the section: ${section.name} and query ${section.search_query}`, chalk.bgMagenta(JSON.stringify(external_links, null, 2)));

            // TODO: scrape urls
            // - get html of each serp url - done
            // - transform them into embeddings - done
            // - query the embeddings to get the most relevant piece of content - done

            const temporaryNamespaceId = uuid();

            console.log("external_links to vectors", external_links);

            await Promise.all(external_links.map(externalLink => {
              try {
                return urlToVector({
                  namespaceId: temporaryNamespaceId,
                  userId: body.userId,
                  url: externalLink,
                  metadata: {
                    url: externalLink
                  }
                })
              } catch (e) {
                console.log("urlToVector error", getErrorMessage(e))
              }
            }))

            const externalResources = await queryVector({
              namespaceId: temporaryNamespaceId,
              query: section.search_query,
              topK: 10,
              minScore: 0.5,
            });

            external_resources = externalResources.map((item) => ({
              url: item.metadata.url,
              content: item.metadata.content,
            }))

            console.log("external resources", JSON.stringify(external_resources ?? {}, null, 2))

            await deleteNamespace(temporaryNamespaceId)
          }
        } catch (error) {
          console.error("Error getting realtime data", getErrorMessage(error))
        }
      }

      const getYoutube = async () => {
        try {
          if (body.with_youtube_videos && section.youtube_search) {
            console.log("Search youtube videos, query:", section.youtube_search)
            const youtubeVideos = (await Promise.all(
              [
                searchYouTubeVideos(section.youtube_search),
                searchYouTubeVideos(section?.keywords?.slice?.(0, 30) ?? "")
              ]
            ))
              .flat()
              .map((youtubeVideo) => {
                return {
                  id: youtubeVideo?.id?.videoId,
                  name: youtubeVideo?.snippet?.title,
                  description: youtubeVideo?.snippet?.description,
                }
              })
              .filter(video => video.id && video.name && video.description)

            if (youtubeVideos) {
              console.log(`We found ${youtubeVideos.length} relevant videos for:`, section.youtube_search, JSON.stringify(youtubeVideos, null, 2));
              console.log("We search for the most relevant video for this section:", section.name)

              const { object: relevantYoutubeVideo } = await generateObject({
                output: "object",
                model: openai("gpt-4o"),
                temperature: 0.5,
                schemaName: "relevant_youtube_video",
                schema: getRelevantYoutubeVideoSchema(),
                prompt: getRelevantYoutubeVideoPrompt({
                  query: section.youtube_search,
                  youtubeVideos
                }),
              });

              selectedYoutubeVideo = relevantYoutubeVideo;

              console.log("The most relevant video is:", JSON.stringify(relevantYoutubeVideo, null, 2));
            } else {
              console.log("No video found for the query:", section.youtube_search)
            }
          }
        } catch (error) {
          console.error("Error embedding youtube video:", getErrorMessage(error));
        }
      }

      await Promise.all([
        generateImage(),
        getRealtimeData(),
        getYoutube()
      ])

      console.log(`[start]: ${index}) ${section.name}`);

      try {
        // const _openai = new OpenAI({
        //   apiKey: process.env.NVIDIA_TOKEN ?? "",
        //   baseURL: 'https://integrate.api.nvidia.com/v1',
        // })

        // const completion = await _openai.chat.completions.create({
        //   model: "nvidia/nemotron-4-340b-instruct",
        //   messages: [
        //     {
        //       "role": "system",
        //       "content": "You are a Storyteller & SEO writer expert who writes engaging content that speak to the right target audience.\nProduct info:\nProject name: TEST2\nWebsite: https://netflix.com\nDescription: Watch Netflix movies & TV shows online or stream right to your smart TV, game console, PC, Mac, mobile, tablet and more.\nLanguage: English\n===\nWriting style example to imitate:\nundefined"
        //     },
        //     {
        //       "role": "user",
        //       "content": getSectionPrompt({
        //         outline,
        //         headline: body.title,
        //         prefix: "##",
        //         // keywords: section?.keywords ?? "",
        //         word_count: section?.word_count ?? 250,
        //         name: section.name,
        //         call_to_action: section?.call_to_action,
        //         call_to_action_example: section?.call_to_action_example,
        //         custom_prompt: section?.custom_prompt,
        //         image,
        //         internal_links: section?.internal_links,
        //         external_links,
        //         external_resources,
        //         // images: section?.images,
        //         // video_url: section?.video_url,
        //         video: selectedYoutubeVideo?.id ? {
        //           id: selectedYoutubeVideo.id,
        //           name: selectedYoutubeVideo?.name,
        //           description: selectedYoutubeVideo?.description,
        //         } : undefined,
        //         tones: section?.tones,
        //         purposes: section?.purposes,
        //         emotions: section?.emotions,
        //         vocabularies: section?.vocabularies,
        //         sentence_structures: section?.sentence_structures,
        //         perspectives: section?.perspectives,
        //         writing_structures: section?.writing_structures,
        //         instructional_elements: section?.instructional_elements,
        //       })
        //     }
        //   ],
        //   temperature: shuffle([0.4, 0.5, 0.6, 0.7])[0],
        //   top_p: 0.7,
        //   max_tokens: 1024,
        //   stream: false,
        // })

        // const sectionContentMarkdown = { text: completion.choices[0].message.content }

        const sectionContentMarkdown = await generateText({
          // output: "object",
          // model: openai(shuffle(["gpt-4o", "gpt-4-0613"])[0]),
          model: shuffle([anthropic("claude-3-5-sonnet-20240620"), openai(shuffle(["gpt-4o", "gpt-4-0613"])[0])])[0],
          // temperature: shuffle([0.3, 0.4, 0.5, 0.7, 0.8])[0],
          temperature: shuffle([0.4, 0.5, 0.6, 0.7])[0],
          // temperature: shuffle([0.3, 0.4, 0.5])[0],
          // schemaName: "section",
          // schema: getSectionSchema(),
          prompt: getSectionPrompt({
            outline,
            headline: body.title,
            prefix: "##",
            // keywords: section?.keywords ?? "",
            word_count: section?.word_count ?? 250,
            name: section.name,
            call_to_action: section?.call_to_action,
            call_to_action_example: section?.call_to_action_example,
            custom_prompt: section?.custom_prompt,
            image,
            internal_links: section?.internal_links,
            external_links,
            external_resources,
            // images: section?.images,
            // video_url: section?.video_url,
            video: selectedYoutubeVideo?.id ? {
              id: selectedYoutubeVideo.id,
              name: selectedYoutubeVideo?.name,
              description: selectedYoutubeVideo?.description,
            } : undefined,
            tones: section?.tones,
            purposes: section?.purposes,
            emotions: section?.emotions,
            vocabularies: section?.vocabularies,
            sentence_structures: section?.sentence_structures,
            perspectives: section?.perspectives,
            writing_structures: section?.writing_structures,
            instructional_elements: section?.instructional_elements,
          }),
        })

        let markdown: string = sectionContentMarkdown.text;

        if (image?.href || image?.includes("data:")) {
          markdown = markdown.replace('@@image@@', `<img src="${image?.href || image}" alt="${image?.alt ?? ''}" width="600" height="auto" />`)
        }

        if (selectedYoutubeVideo?.id) {
          markdown = markdown.replace("@@video@@", `<iframe width="560" height="315" src="https://www.youtube.com/embed/${selectedYoutubeVideo.id}" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`);
        }

        markdown = markdown.replaceAll('@@image@@', "")
        markdown = markdown.replaceAll('@@video@@', "")

        const avoidWordsRegex = new RegExp(`(${avoidWords.join('|')})`, 'gi');

        let stats = getSummary(markdown);
        if (avoidWordsRegex.test(markdown) || stats.FleschKincaidGrade > 12) {
          console.log("- rephrase");
          const rephraseSectionContent = await generateText({
            model: shuffle([openai("gpt-4o")])[0],
            temperature: 0.2,
            prompt: getRephraseInstruction(markdown),
          })
          markdown = rephraseSectionContent.text;
          console.log("- rephrase done");
        }

        finalResult.sections[index] = removeMarkdownWrapper(markdown)
      } catch (error) {
        console.error(chalk.bgRed(`[ERROR] generating section ${index}) ${section.name}:`), getErrorMessage(error));
        throw error;
      }

      console.log(`[end]: ${index}) ${section.name}`);
    }

    await Promise.all(
      (Object.entries(outlinePlan.sections) as any).map(([index, section]) => {
        return writeSection({ index, section })
      })
    );

    finalResult.sections = Object.values(finalResult.sections)


    console.log("finalResult", JSON.stringify(finalResult, null, 2))

    const tableOfContentMarkdown = getTableOfContent(finalResult.sections.join("\n\n"))
    console.log("Table of content markdown", tableOfContentMarkdown);

    const recomposedArticle = compact([
      finalResult.featured_image && `![featured image](${finalResult.featured_image})`,
      body.with_table_of_content && tableOfContentMarkdown,
      finalResult.hook,
      finalResult.sections.join("\n\n"),
    ]).join("\n");

    console.log("full article markdown", chalk.blueBright(recomposedArticle));

    // CONVERT MARKDOWN ARTICLE TO HTML
    const html = convertMarkdownToHTML(recomposedArticle);
    console.log("html", chalk.redBright(html));

    // END PERFORMANCE CALCULATION
    const end = performance.now();
    const writingTimeInSeconds = (end - start) / 1000;

    const allSchemaMarkups = await getAndSaveSchemaMarkup({
      project,
      articleId,
      article: {
        meta_description: finalResult.meta_description,
        text: recomposedArticle
      },
      lang: language.label,
      structuredSchemas: body.structured_schemas,
    });

    // GET ARTICLE STATS
    const articleStats = getSummary(recomposedArticle);

    const result = {
      markdown: recomposedArticle,
      html,
      writingTimeInSeconds,
      articleId,
      wordCount: articleStats.words,
      featuredImage: featuredImage ?? "",
      metaDescription: finalResult.meta_description,
      status: 'ready_to_view'
    }

    if (body.integration_id) {
      result.status = 'publishing'
    }

    await markArticleAs(result);

    await deductCredits({
      userId: body.userId,
      costInCredits: articleStats.words + getSummary(JSON.stringify(allSchemaMarkups, null, 2)).words,
      featureName: "write",
      premiumName: "words"
    });

    return NextResponse.json({
      markdown: recomposedArticle,
      html,
      writingTimeInSeconds,
      stats: articleStats,
      featuredImage: featuredImage ?? "",
      metaDescription,
    }, { status: 200 });
  } catch (error) {
    console.log("blog-post/write error", getErrorMessage(error))
    await markArticleAsFailure({ articleId, error })
    return NextResponse.json(error, { status: 500 });
  }
}