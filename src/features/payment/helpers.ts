import { supabaseAdmin } from "@/helpers/supabase";
import {
  CheckoutData,
  GetCheckoutData,
  GetCheckoutReturnUrl,
  GetCustomerPortalUrl,
  GetSessionStatusUrl,
  GetWebhookEvent,
  HandleWebhookEvent,
  SessionStatus,
} from "./types";
import { stripeUrls, webhookEvents } from "./constants";
import chalk from "chalk";
import { isEmpty } from "lodash";

const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY ?? "");
const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");

export const getCheckoutData = ({
  priceId,
  metadata,
  customerId,
  customerEmail,
  origin,
  referral
}: GetCheckoutData): CheckoutData => {
  if (customerId) {
    return {
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      // ui_mode: 'embedded',
      success_url: getCheckoutReturnUrl({ origin }), // NOTE: ?success=true
      cancel_url: getCheckoutReturnUrl({ origin }), // NOTE: add ?canceled=true
      automatic_tax: { enabled: true },
      customer: customerId,
      customer_update: {
        address: 'auto',
      },
      metadata: {
        ...(metadata ?? {}),
        promotekit_referral: referral,
      },
    }
  }
  return {
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    // ui_mode: 'embedded',
    success_url: getCheckoutReturnUrl({ origin }), // NOTE: ?success=true
    cancel_url: getCheckoutReturnUrl({ origin }), // NOTE: add ?canceled=true
    automatic_tax: { enabled: true },
    customer_email: customerEmail,
    metadata: {
      ...(metadata ?? {}),
      promotekit_referral: referral,
    },
  }
}

export const getSessionStatusUrl = ({ sessionId, userId }: GetSessionStatusUrl) => {
  return stripeUrls.SESSION_STATUS
    .replace("SESSION_ID", sessionId)
    .replace("USER_ID", userId)
}

export const getCheckoutReturnUrl = ({ origin, checkoutSessionId = "" }: GetCheckoutReturnUrl) => {
  return stripeUrls.RETURN_CHECKOUT
    .replace("ORIGIN", origin)
    .replace("CHECKOUT_SESSION_ID", checkoutSessionId)
}

export const createCheckoutSession = async (checkoutData: CheckoutData): Promise<string> => {
  const session = await stripe.checkout.sessions.create(checkoutData);
  return session.url
  // return session.client_secret
}

export const getCustomerPortalUrl = async ({
  customerId,
  origin
}: GetCustomerPortalUrl): Promise<string> => {
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: getCheckoutReturnUrl({ origin }),
  });

  return portalSession.url
}

export const getSessionStatus = async (sessionId: string): Promise<SessionStatus> => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return {
    status: session.status,
    customerEmail: session.customer_details.email
  }
}

export const getPrices = async (ids: string[]) => {
  const query = ids.map((id) => `product:"${id}"`).join(" OR ");
  const prices = await stripe.prices.search({
    query
  });
  return prices;
}

// Product ids are prefixed with "prod_" like "prod_PwY2NE"
export const getProducts = async (ids: string[]) => {
  const products = await stripe.products.list({
    ids
  });
  return products
}

export const getWebhookSecret = (origin: string) => {
  // If you are testing your webhook locally with the Stripe CLI, you can find the
  // endpoint's secret by running `stripe listen`. Otherwise, find your
  // endpoint's secret in your webhook settings in the Developer Dashboard
  // This is your Stripe CLI webhook secret for testing your endpoint locally.
  const secrets = {
    localhost: process.env.STRIPE_WEBHOOK_LOCALHOST,
    test_mode: process.env.STRIPE_WEBHOOK_TEST,
    live_mode: process.env.STRIPE_WEBHOOK_LIVE,
  }

  let webhookSecret = secrets.test_mode;
  if (origin.includes("localhost")) {
    webhookSecret = secrets.localhost;
  }
  if (process.env.NODE_ENV === "production") {
    webhookSecret = secrets.live_mode;
  }

  return webhookSecret ?? "";
}

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

// export const handleWebhookEvent = async (event: HandleWebhookEvent) => {
//   switch (event.type) {
//     // https://byedispute.com/blog/how-to-code-a-stripe-subscription-model-with-react-and-nextjs
//     // https://byedispute.com/blog/how-stripe-subscriptions-work
//     case webhookEvents.checkout_session_completed:
//       // ✅ The user paid successfully
//       // TODO: turn user.premium on and set user.subscription
//       const checkoutSession = event.data.object;
//       await updateUserSubscription({ event_type: event.type, subscription_id: checkoutSession.subscription, customer_id: checkoutSession.customer, data: event.data.object })
//       break;
//     case webhookEvents.customer_subscription_created:
//     // ❌ The subscription was canceled, revoke access to user and reset credits
//     case webhookEvents.customer_subscription_deleted: {
//       // case webhookEvents.customer_subscription_updated:
//       const subscription = event.data.object;
//       await updateUserSubscription({ event_type: event.type, subscription_id: subscription.id, customer_id: subscription.customer, data: event.data.object })
//       break;
//     }
//     case webhookEvents.invoice_paid: {
//       // ✅ A payment was made usually a recurring payment for a subscription
//       const subscription = event.data.object;
//       await updateUserSubscription({ event_type: event.type, subscription_id: subscription.id, customer_id: subscription.customer, data: event.data.object })
//       break;
//     }

//     case webhookEvents.invoice_payment_failed:
//       console.log({ event: event.type }, event.data.object)
//       // ❌ Suspend the user from using his credits or paid features
//       // TODO: update user.subscription.status, event.data.object.status should be set to "open"
//       // only user.subscription.status set to "active" have access to paid features
//       // TODO: display a banner for failed payments
//       break;

//     default:
//     // console.log(`Unhandled event type ${event.type}`);
//   }
// }

export const stripeUnixTimestampToDate = (unixTimestamp: number) => {
  const milliseconds = unixTimestamp * 1000
  return new Date(milliseconds)
}

export const handleWebhookEvent = async (event: HandleWebhookEvent) => {
  const eventObject = event.data.object;
  const { data: user } = await supabase.from("users").select().eq("customer_id", eventObject.customer).maybeSingle();
  const subscription = user?.subscription ?? {};

  switch (event.type) {
    case webhookEvents.customer_subscription_created: {
      console.log(chalk.yellow(event.type), eventObject)
      await supabase.from("users").update({
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
        await supabase.from("users").update({
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
        await supabase.from("users").update({
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
      await supabase.from("users").update({ subscription: null }).eq("customer_id", eventObject.customer)
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

      await supabase.from("users").update({
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

export const getUserSubscriptions = async (customerId: string) => {
  const subscriptions = await stripe.subscriptions.list({
    limit: 5,
    customer: customerId,
  });

  return subscriptions.data;
}

export const updateUserSubscription = async ({ event_type, subscription_id, customer_id }: any) => {
  console.log(`[${event_type}] UPDATE USER SUBSCRIPTION`)

  const subscription = await stripe.subscriptions.retrieve(subscription_id, {
    expand: ['default_payment_method']
  });

  // console.log(`[${event_type}] DID WE GET A SUBSCRIPTION?`, subscription)

  if (!subscription?.id) {
    throw new Error(`[${event_type}] Subscription lookup failed. stripe_customer_id: ${customer_id}`);
  }

  const customer = await stripe.customers.retrieve(customer_id);

  const customerEmail = customer?.email ?? customer?.customer_email ?? subscription?.customer_details?.email ?? ""
  console.log("CUSTOMER EMAIL", customerEmail)
  console.log(`[${event_type}] GET USER SUBSCRIPTION`)

  const updatedSubscription = {
    id: subscription.id,
    email: customerEmail,
    plan: subscription.plan,
    status: subscription.status,
    price_id: subscription?.items?.data?.[0]?.price?.id,
    customer_id: customer_id ?? "",
    credits: subscription.credits,
    projects_limit: subscription.plan.metadata.projects_limit,
    cancel_at: subscription.cancel_at,
    current_period_end: subscription.current_period_end,
  }

  if (customerEmail) {
    const { data: user } = await supabase.from("users").select().eq("email", customerEmail).maybeSingle();
    const subscription = user?.subscription ?? {};
    const oldPlanCredits = +user?.subscription?.plan?.metadata?.credits ?? 0
    const newPlanCredits = +subscription?.plan?.metadata?.credits ?? 0
    const isUpgrade = newPlanCredits > oldPlanCredits;
    const isRenewing = newPlanCredits === oldPlanCredits;

    if (isRenewing || isUpgrade) {
      updatedSubscription.credits = newPlanCredits;
    }
  }

  if (event_type === webhookEvents.customer_subscription_deleted) {
    updatedSubscription.credits = 0
  }

  // TODO: keep the amount of credits the user had if he downgrades (object.amount_due) or if the transation amount is 0
  console.log(`[${event_type}] UPSERT`, updatedSubscription)
  await supabase.from("users").update({ subscription: updatedSubscription }).eq("email", customerEmail).throwOnError()
}

export const upsertStripeCustomer = async (userId: string) => {
  const { data: user } = await supabase.from('users').select().eq("id", userId).maybeSingle().throwOnError();
  try {
    const customers = await stripe.customers.search({
      query: `email: '${user.email}'`,
      limit: 1,
    });

    const existingCustomer = customers?.data?.[0];

    if (existingCustomer) {
      return existingCustomer;
    }

    if (user) {
      console.log("create new customer")
      const customer = await stripe.customers.create({
        email: user.email ?? "",
      });
      await supabase.from("users").update({ customer_id: customer.id }).eq("id", userId).throwOnError();
      return customer;
    }

    return null;
  } catch {

  }
}