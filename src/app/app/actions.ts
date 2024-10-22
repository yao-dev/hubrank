'use server';;
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { google } from 'googleapis';
import { createCheckoutSession } from '@/features/payment/helpers/create-checkout-session';
import { deductCredits } from '../api/helpers';
import { getSummary } from 'readability-cyr';
import { Webflow, WebflowClient } from "webflow-api";
import axios from 'axios';
import prettify from "pretty";

const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY ?? "");

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY
})

export async function getAIAutocomplete({
  type,
  value,
  userId
}: { type: string, value: string; userId: string }) {
  const { text, finishReason, usage } = await generateText({
    model: openai('gpt-4o'),
    prompt: `${type} the text below:\n\n${value}\n\nOutput the same format as the Input`,
  });

  await deductCredits({
    userId,
    costInCredits: getSummary(text).words,
    featureName: "ai autocomplete",
    premiumName: "words",
  });

  return { text, finishReason, usage };
}


export const searchYouTubeVideos = async (query: string) => {
  try {
    if (!query) {
      return [];
    }

    const response = await youtube.search.list({
      part: ["snippet"],
      maxResults: 25,
      q: query,
    })
    return response.data.items;
  } catch (error) {
    console.error('Error fetching YouTube videos:', error?.response);
    throw error;
  }
}

export const checkout = async (body: { url: string; words: number; customer_email: string; referral: any }) => {
  const ONE_ARTICLE_WORD_COUNT = 1500;
  let costPerWord;
  let pricingTitle;

  if (body.words >= ONE_ARTICLE_WORD_COUNT * 200) {
    pricingTitle = "Enterprise";
    costPerWord = 0.0009
  } else if (body.words >= ONE_ARTICLE_WORD_COUNT * 100) {
    pricingTitle = "Pro";
    costPerWord = 0.0010
  } else if (body.words >= ONE_ARTICLE_WORD_COUNT * 10) {
    pricingTitle = "Growth";
    costPerWord = 0.0011;
  } else {
    pricingTitle = "Starter";
    costPerWord = 0.0012;
  }


  const usdPrice = Math.round(costPerWord * body.words) * 100;
  const addOns = {
    keywords_research: Math.floor((body.words / ONE_ARTICLE_WORD_COUNT) * 5),
    ai_images: Math.floor((body.words / ONE_ARTICLE_WORD_COUNT) * 3),
  }

  const metadata = {
    usd_price: usdPrice,
    words: body.words,
    keywords_research: addOns.keywords_research,
    ai_images: addOns.ai_images,
    promotekit_referral: body.referral,
    customer_email: body.customer_email
  }

  const price = await stripe.prices.create({
    currency: 'usd',
    unit_amount: usdPrice,
    product_data: {
      name: `${pricingTitle} Pack - ${body.words} words`,
    },
    metadata
  });

  const checkoutSessionUrl = await createCheckoutSession({
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: price.id,
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${body.url}?checkout_success=true`,
    cancel_url: `${body.url}?checkout_canceled=true`,
    automatic_tax: { enabled: true },
    customer_email: body.customer_email,
    metadata,
  }
  );


  return checkoutSessionUrl
}

const getWebflowClient = (accessToken: string) => new WebflowClient({ accessToken });

export const getWebflowSites = (accessToken: string): Promise<Webflow.Sites> => {
  const webflow = getWebflowClient(accessToken);
  return webflow.sites.list();
}

export const getWebflowCollections = ({ siteId, accessToken }: { siteId: string, accessToken: string }): Promise<Webflow.CollectionList> => {
  const webflow = getWebflowClient(accessToken);
  return webflow.collections.list(siteId);
}

export const getWebflowCollectionItems = ({ collectionId, accessToken }: { siteId: string, collectionId: string, accessToken: string }): Promise<Webflow.Collection> => {
  const webflow = getWebflowClient(accessToken);
  return webflow.collections.get(collectionId)
}

export const publishZapierBlogPost = async ({ url, blogPost }: any) => {
  return await axios.post(url, blogPost, {
    headers: {
      Authorization: `Bearer ${process.env.ZAPIER_TOKEN ?? ''}`
    }
  });
}

export const getMediumUser = async (token: string): Promise<{
  id: string;
  username: string;
  name: string;
  url: string;
  imageUrl: string;
}> => {
  const { data } = await axios.get("https://api.medium.com/v1/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data?.data;
}

export const publishMediumPost = async (data: {
  token: string;
  authorId: string;
  blogPost: {
    title: string;
    html: string;
    publishStatus?: "draft" | "unlisted" | "public";
    notifyFollowers?: boolean;
  }
}) => {
  const url = `https://api.medium.com/v1/users/${data.authorId}/posts`;

  return axios.post(url, {
    title: data.blogPost.title,
    contentFormat: "html",
    content: prettify(
      `<h1>${data.blogPost.title}</h1>${data.blogPost.html}`
    ),
    publishStatus: data.blogPost.publishStatus ?? "draft",
    notifyFollowers: data.blogPost.notifyFollowers ?? false,
  }, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.token}`,
    }
  });
}