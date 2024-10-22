import { NextResponse } from "next/server";
import { getWritingConcurrencyLeft, getUpstashDestination, updateBlogPost, getErrorMessage } from "../helpers";
import supabase from "@/helpers/supabase/server";
import { createSchedule } from "@/helpers/qstash";
import GhostAdminAPI from '@tryghost/admin-api';
import axios from "axios";
import { WebflowClient } from "webflow-api";
import { omit } from "lodash";
import { publishMediumPost, publishZapierBlogPost } from "@/app/app/actions";

export const maxDuration = 30;

const markAsError = "MARK_AS_ERROR";

export async function POST(request: Request) {
  const body = await request.json();

  try {
    switch (body.type) {
      case 'UPDATE': {
        if (
          ["queue", "writing"].includes(body.old_record?.status) && body.record.status === "error" ||
          ["writing"].includes(body.old_record?.status) && body.record.status === "ready_to_view"
        ) {
          const concurrencyLeft = await getWritingConcurrencyLeft()

          if (concurrencyLeft > 0) {
            const { data: blogPosts } = await supabase().from("blog_posts").select("*").neq("id", body.record.id).eq("status", "queue").order("created_at", { ascending: false }).limit(concurrencyLeft).throwOnError();
            const blogPostsWithUpdatedStatus = blogPosts?.map((item) => {
              return {
                ...item,
                status: "writing"
              }
            })
            await supabase().from('blog_posts').upsert(blogPostsWithUpdatedStatus).throwOnError()
          }
        } else if (body.old_record?.status !== "writing" && body.record.status === "writing") {
          const scheduleId = await createSchedule({
            destination: getUpstashDestination("api/write/blog-post"),
            body: body.record.metadata,
          });

          if (scheduleId) {
            await updateBlogPost(body.record.id, { schedule_id: scheduleId })
          }
        } else if (body.old_record?.status !== "publishing" && body.record.status === "publishing") {
          // TODO: handle re-publish/update case
          const { data: integration } = await supabase().from("integrations").select("*").eq("id", body.record.integration_id).maybeSingle().throwOnError();

          switch (integration?.platform) {
            case 'ghost': {
              const api = new GhostAdminAPI({
                url: integration.metadata.api_url.endsWith("/") ? integration.metadata.api_url.slice(0, -1) : integration.metadata.api_url,
                key: integration.metadata.admin_api_key,
                version: 'v5.0'
              });

              const result = await api.posts.add({
                title: body.record.title,
                html: body.record.html,
                status: integration.metadata.status ?? "draft",

                // meta_description: body.record.meta_description,
                // feature_image: body.record.featured_image,
                // slug: body.record.slug,
                // meta_title: body.record.title,
                // facebook_title: body.record.title,
                // facebook_description: body.record.meta_description,
                // facebook_image: body.record.featured_image,
                // twitter_title: body.record.title,
                // twitter_description: body.record.meta_description,
                // twitter_image: body.record.featured_image,

                // og_image
                // og_image_description
              }, { source: 'html' });

              await supabase().from("publications").insert({ blog_post_id: body.record.id, integration_id: integration.id, metadata: result });
              break;
            }
            case 'webhook': {
              const blogPost = {
                id: body.record.id,
                created_at: body.record.created_at,
                status: body.record.status,
                html: body.record.html,
                markdown: body.record.markdown,
                title: body.record.title,
                seed_keyword: body.record.seed_keyword,
                meta_description: body.record.meta_description,
                featured_image: body.record.featured_image,
                slug: body.record.slug
              };
              await axios.post(integration.metadata.webhook, blogPost);
              await supabase().from("publications").insert({ blog_post_id: body.record.id, integration_id: integration.id });
              break;
            }
            case 'zapier': {
              await publishZapierBlogPost({ url: integration.metadata.url, blogPost: body.record });
              break;
            }
            case 'medium': {
              const result = await publishMediumPost({
                token: integration.metadata.token,
                authorId: integration.metadata.author_id,
                blogPost: {
                  title: body.record.title,
                  html: body.record.html,
                  publishStatus: integration.metadata.status,
                  notifyFollowers: integration.metadata.notify_followers,
                }
              });

              await supabase().from("publications").insert({ blog_post_id: body.record.id, integration_id: integration.id, metadata: result?.data });

              break;
            }
            case 'webflow': {
              const { data: lastPublish } = await supabase().from("publications").select().match({ blog_post_id: body.record.id, integration_id: integration.id }).maybeSingle();

              const fieldData: { [key: string]: any } = {};

              console.log({ integration })

              Object.keys(integration.metadata).filter((key) => key.startsWith("fields")).forEach((key) => {
                const fieldId = key.replace("fields.", "");
                fieldData[fieldId] = body.record[integration.metadata[key]]

                if (typeof integration.metadata[key] === "boolean") {
                  fieldData[fieldId] = integration.metadata[key]
                }
              });

              console.log({
                payload: {
                  id: body.record.id.toString(),
                  isArchived: false,
                  isDraft: integration.metadata.draft,
                  fieldData,
                }
              })

              const webflow = new WebflowClient({ accessToken: integration.metadata.access_token });

              if (!lastPublish) {
                const result = await webflow.collections.items.createItem(integration.metadata.collection_id, {
                  id: body.record.id.toString(),
                  isArchived: false,
                  isDraft: integration.metadata.draft,
                  fieldData: {
                    ...fieldData,
                    name: body.record.title,
                    slug: body.record.slug,
                  },
                });

                await supabase().from("publications").insert({ blog_post_id: body.record.id, integration_id: integration.id, metadata: result });
              } else {
                const result = await webflow.collections.items.updateItem(integration.metadata.collection_id, lastPublish.metadata.id, {
                  id: body.record.id.toString(),
                  isArchived: false,
                  isDraft: integration.metadata.draft,
                  fieldData: lastPublish.metadata.slug !== fieldData.slug ? {
                    ...fieldData,
                    slug: fieldData.slug,
                    name: body.record.title,
                  } : {
                    ...omit(fieldData, "slug"), // NOTE: seems like the slug can't be edited with the same value
                    name: body.record.title,
                  },
                });
                await supabase().from("publications").update({ metadata: result }).eq("id", lastPublish.id);
              }
            }
          }

          await supabase().from("blog_posts").update({ status: "published" }).eq("id", body.record.id);
        }
        break;
      }
      case markAsError: {
        await supabase().from("blog_posts").update({ status: "error" }).eq("id", body.blog_post_id).throwOnError()
        break;
      }
    }

    return NextResponse.json({ message: "Blog post webhook success", body }, { status: 200 })
  } catch (error) {
    await supabase().from("blog_posts").update({ status: body.old_record.status }).eq("id", body.record.id)
    throw new Error("Blog post webhook error", { cause: { error: getErrorMessage(error), body } });
  }
}