import { GetCustomerPortalUrl } from "../types";
import { getCheckoutReturnUrl } from "./get-checkout-return-url";

const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY ?? "");

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