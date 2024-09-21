import chalk from "chalk";
import { GetWebhookEvent } from "../types";

const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY ?? "");

export const getWebhookEvent = ({
  stripeSignature,
  webhookSecret,
  webhookValue
}: GetWebhookEvent) => {
  if (!stripeSignature || !webhookSecret) {
    return new Response('Webhook secret not found.', { status: 400 });
  }
  const event = stripe.webhooks.constructEvent(webhookValue, stripeSignature, webhookSecret);
  console.log(`🔔  Webhook received:`, chalk.yellow(event.type));
  return event;
}