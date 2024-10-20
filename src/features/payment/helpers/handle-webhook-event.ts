import chalk from "chalk";
import { isEmpty, isNaN } from "lodash";
import supabase from "@/helpers/supabase/server";
import { HandleWebhookEvent } from "../types";
import { webhookEvents } from "../constants";

const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY ?? "");

export const getSafeNumber = (value?: string | number) => {
  if (!value) return 0;
  const convertedValue = +value;
  return isNaN(convertedValue) ? 0 : convertedValue;
}

export const upsertUserPremiumData = async ({
  customerId,
  words,
  keywords_research,
  ai_images
}) => {
  const { data: user } = await supabase().from("users").select().eq("customer_id", customerId).maybeSingle();
  const { data: userPremium } = await supabase().from("users_premium").select().eq("customer_id", customerId).maybeSingle()

  if (isEmpty(userPremium)) {
    await supabase().from("user_premium").insert({ user_id: user.id, customer_id: customerId }).throwOnError()
  }

  await supabase().from("users_premium").update({
    words: getSafeNumber(userPremium?.words) + getSafeNumber(words),
    keywords_research: getSafeNumber(userPremium?.keywords_research) + getSafeNumber(keywords_research),
    ai_images: getSafeNumber(userPremium?.ai_images) + getSafeNumber(ai_images),
    updated_at: new Date()
  }).eq("customer_id", customerId);
}

export const handleWebhookEvent = async (event: HandleWebhookEvent) => {
  const eventObject = event.data.object;
  const customerId = eventObject.customer

  switch (event.type) {
    case webhookEvents.checkout_session_completed: {
      console.log(chalk.yellow(event.type), eventObject);

      await upsertUserPremiumData({
        column: "customer_id",
        columnValue: customerId,
        words: eventObject?.metadata?.words,
        keywords_research: eventObject?.metadata?.keywords_research,
        ai_images: eventObject?.metadata?.ai_images,
      })
      break;
    }
    case webhookEvents.checkout_session_expired: {
      console.log(chalk.yellow(event.type), eventObject);

      // TODO: delete product or price id
      break;
    }

    default:
    // console.log(`Unhandled event type ${event.type}`);
  }
}