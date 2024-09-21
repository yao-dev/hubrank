import supabase from "@/helpers/supabase/server";
import { webhookEvents } from "../constants";

const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY ?? "");

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
    const { data: user } = await supabase().from("users").select().eq("email", customerEmail).maybeSingle();
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
  await supabase().from("users").update({ subscription: updatedSubscription }).eq("email", customerEmail).throwOnError()
}