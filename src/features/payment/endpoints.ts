import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { upsertStripeCustomer } from "./helpers/upsert-stripe-customer";
import { getCheckoutData } from "./helpers/get-checkout-data";
import { createCheckoutSession } from "./helpers/create-checkout-session";
import { getCheckoutReturnUrl } from "./helpers/get-checkout-return-url";
import { getCustomerPortalUrl } from "./helpers/get-customer-portal-url";
import { getPrices } from "./helpers/get-prices";
import { getProducts } from "./helpers/get-products";
import { getSessionStatus } from "./helpers/get-session-status";
import { getWebhookSecret } from "./helpers/get-webhook-secret";
import { getWebhookEvent } from "./helpers/get-webhook-event";
import { handleWebhookEvent } from "./helpers/handle-webhook-event";
import { getUserSubscriptions } from "./helpers/get-user-subscriptions";

export default {
  upsertStripeCustomer: async (req: NextRequest): Promise<Response> => {
    const body = await req.json()
    try {
      if (!body.id) {
        throw new Error('Cannot create stripe customer, user id is missing.')
      }
      const customer = await upsertStripeCustomer(body.id);
      return NextResponse.json({ customer });
    } catch (e: any) {
      const errorMessage = `❌ Error (upsertStripeCustomer): ${e?.message}`
      console.log(errorMessage);
      return new Response(errorMessage, { status: 400 });
    }
  },
  createCheckoutSession: async (req: NextRequest): Promise<NextResponse<unknown>> => {
    const body = await req.json()
    const origin = req.nextUrl.origin;

    try {
      const checkoutData = getCheckoutData({
        priceId: body.price_id,
        metadata: body.metadata,
        customerId: body.customer_id,
        customerEmail: body.customer_email,
        origin,
        referral: body.referral
      })

      const checkoutSessionUrl = await createCheckoutSession(checkoutData);
      return NextResponse.json({ checkoutSessionUrl })
    } catch (e: any) {
      console.log(`❌ Error message: ${e?.message}`);
      return NextResponse.redirect(getCheckoutReturnUrl({ origin }))
    }
  },
  customerPortal: async (req: NextRequest): Promise<Response> => {
    try {
      const body = await req.json()
      const origin = req.nextUrl.origin;

      const url = await getCustomerPortalUrl({
        customerId: body.customerId,
        origin,
      })

      return NextResponse.json({ url });
    } catch (e: any) {
      const errorMessage = `❌ Error (customerPortal): ${e?.message}`
      console.log(errorMessage);
      return new Response(errorMessage, { status: 400 });
    }
  },
  prices: async (req: Request): Promise<Response> => {
    const body = await req.json()

    try {
      const prices = await getPrices(body.ids)
      return NextResponse.json({ prices })
    } catch (e: any) {
      const errorMessage = `❌ Error (prices): ${e?.message}`
      console.log(errorMessage);
      return new Response(errorMessage, { status: 400 });
    }
  },
  products: async (ids: string[]) => {
    try {
      const products = await getProducts(ids);
      return NextResponse.json({ products })
    } catch (e: any) {
      const errorMessage = `❌ Error (products): ${e?.message}`
      console.log(errorMessage);
      return new Response(errorMessage, { status: 400 });
    }
  },
  sessionStatus: async (req: NextRequest): Promise<Response> => {
    try {
      // const userId = req.nextUrl.searchParams.get("user_id") ?? "";
      // await supabase.from("users").update({ stripe_customer_id: session.customer }).eq("id", userId)
      const sessionStatus = await getSessionStatus(req.nextUrl.searchParams.get("session_id") ?? "")
      return NextResponse.json({
        status: sessionStatus.status,
        customer_email: sessionStatus.customerEmail,
      })
    } catch (e: any) {
      const errorMessage = `❌ Error (sessionStatus): ${e?.message}`
      console.log(errorMessage);
      return new Response(errorMessage, { status: 400 });
    }

  },
  webhook: async (req: NextRequest): Promise<Response> => {
    const stripeSignature = headers().get("stripe-signature") ?? ""

    let event;

    const webhookSecret = getWebhookSecret(req.nextUrl.origin)

    try {
      event = getWebhookEvent({
        stripeSignature,
        webhookSecret,
        webhookValue: await req.text()
      });
    } catch (e: any) {
      const errorMessage = `❌ Error (webhook): ${e?.message}`
      console.log(errorMessage);
      return new Response(errorMessage, { status: 400 });
    }

    try {
      await handleWebhookEvent(event)
    } catch (e: any) {
      const errorMessage = `❌ Error (webhook handler): ${e?.message}`
      console.log(errorMessage);
      return new Response(errorMessage, { status: 400 });
    }

    return new Response(JSON.stringify({ received: true }));
  },
  userSubscriptions: async (req: NextRequest): Promise<Response> => {
    try {
      const body = await req.json();
      const subscriptions = await getUserSubscriptions(body.customerId);
      return NextResponse.json({ subscriptions })
    } catch (e: any) {
      const errorMessage = `❌ Error (userSubscriptions): ${e?.message}`
      console.log(errorMessage);
      return new Response(errorMessage, { status: 400 });
    }
  },
}