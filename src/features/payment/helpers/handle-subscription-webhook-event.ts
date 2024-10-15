import chalk from "chalk";
import { isEmpty } from "lodash";
import supabase from "@/helpers/supabase/server";
import { HandleWebhookEvent } from "../types";
import { webhookEvents } from "../constants";
import { stripeUnixTimestampToDate } from "./stripe-unix-timestamp-to-date";

const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY ?? "");

export const handleSubscriptionWebhookEvent = async (event: HandleWebhookEvent) => {
  const eventObject = event.data.object;
  const { data: user } = await supabase().from("users").select().eq("customer_id", eventObject.customer).maybeSingle();
  const subscription = user?.subscription ?? {};

  switch (event.type) {
    case webhookEvents.customer_subscription_created: {
      console.log(chalk.yellow(event.type), eventObject)
      await supabase().from("users").update({
        subscription: {
          id: eventObject.id,
          plan: eventObject.plan,
          status: eventObject.status,
          price_id: eventObject.plan?.id,
          current_period_end: stripeUnixTimestampToDate(eventObject.current_period_end),
        }
      }).eq("customer_id", eventObject.customer)
      break;
    }
    case webhookEvents.customer_subscription_updated: {
      // ignore eventObject.status set to "canceled"
      if (eventObject.status === "canceled") {
        break;
      }

      console.log(chalk.yellow(event.type), { ...eventObject, items: JSON.stringify(eventObject.items, null, 2) });

      if (isEmpty(subscription)) {
        console.log(`User with id "${user.id}" doesn't have a subscription`)
        break;
      }

      // DOWNGRADE
      if (+eventObject?.plan?.metadata?.credits < +subscription?.plan?.metadata?.credits) {
        await supabase().from("users").update({
          subscription: {
            id: eventObject.id,
            plan: eventObject.plan,
            status: eventObject.status,
            current_period_end: stripeUnixTimestampToDate(eventObject.current_period_end),
            credits: subscription.credits ?? 0,
            projects_limit: subscription.projects_limit ?? 0,
          }
        }).eq("customer_id", eventObject.customer);
        break;
      }

      // UPGRADE
      if (+eventObject?.plan?.metadata?.credits > +subscription?.plan?.metadata?.credits) {
        await supabase().from("users").update({
          subscription: {
            id: eventObject.id,
            plan: eventObject.plan,
            status: eventObject.status,
            current_period_end: stripeUnixTimestampToDate(eventObject.current_period_end),
            credits: +eventObject?.plan?.metadata?.credits + (+subscription?.credits ?? 0),
            projects_limit: +eventObject?.plan?.metadata?.projects_limit,
          }
        }).eq("customer_id", eventObject.customer);
        break;
      }

      break;
    }
    // ❌ The subscription was canceled, revoke access to user and reset credits
    case webhookEvents.customer_subscription_deleted: {
      console.log(chalk.yellow(event.type), eventObject)
      await supabase().from("users").update({ subscription: null }).eq("customer_id", eventObject.customer)
      break;
    }
    // https://byedispute.com/blog/how-to-code-a-stripe-subscription-model-with-react-and-nextjs
    // https://byedispute.com/blog/how-stripe-subscriptions-work
    case webhookEvents.checkout_session_completed: {
      console.log(chalk.yellow(event.type), eventObject);
      // [Upgrade/New Subscription] we update the status, credits and projects limit
      // User subscribe for the 1st time
      const newSubscriptionData = await stripe.subscriptions.retrieve(eventObject.subscription, {
        expand: ['default_payment_method']
      });

      await supabase().from("users").update({
        subscription: {
          id: eventObject.subscription,
          plan: newSubscriptionData.plan,
          status: newSubscriptionData.status,
          credits: +eventObject?.plan?.metadata?.credits,
          projects_limit: +eventObject?.plan?.metadata?.projects_limit,
          current_period_end: stripeUnixTimestampToDate(newSubscriptionData.current_period_end),
        }
      }).eq("customer_id", eventObject.customer);
      break;

    }

    default:
    // console.log(`Unhandled event type ${event.type}`);
  }
}