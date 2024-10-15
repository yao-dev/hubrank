'use server';;
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { google } from 'googleapis';
import { createCheckoutSession } from '@/features/payment/helpers/create-checkout-session';
const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY ?? "");

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY
})

export async function getAIAutocomplete(type: string, value: string) {
  const { text, finishReason, usage } = await generateText({
    model: openai('gpt-4o'),
    prompt: `${type} the text below:\n\n${value}\n\nOutput the same format as the Input`,
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