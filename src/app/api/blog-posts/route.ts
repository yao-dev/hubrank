import { NextResponse } from "next/server";
import { getWritingConcurrencyLeft, getUpstashDestination, updateBlogPost, publishBlogPost } from "../helpers";
import supabase from "@/helpers/supabase/server";
import { createSchedule } from "@/helpers/qstash";
import GhostAdminAPI from '@tryghost/admin-api';
import axios from "axios";
import { WebflowClient } from "webflow-api";

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

              await api.posts.add({
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
              }, { source: 'html' })
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
              break;
            }
            case 'zapier': {
              await publishBlogPost({ url: integration.metadata.url, blogPost: body.record });
              break;
            }
            case 'webflow': {
              const webflow = new WebflowClient({ accessToken: integration.metadata.access_token });
              await webflow.collections.items.createItem(integration.metadata.collection_id, {
                id: body.record.id,
                isArchived: false,
                isDraft: integration.metadata.status === "draft",
                fieldData: {
                  id: body.record.id,
                  created_at: body.record.created_at,
                  status: body.record.status,
                  html: body.record.html,
                  markdown: body.record.markdown,
                  title: body.record.title,
                  name: body.record.title,
                  seed_keyword: body.record.seed_keyword,
                  meta_description: body.record.meta_description,
                  featured_image: body.record.featured_image,
                  slug: body.record.slug
                }
              });
              //  NOTE: webflow.collections.items.updateItem also exist
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
    throw new Error("Blog post webhook error", { cause: { error, body } });
  }
}