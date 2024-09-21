import { CheckoutData } from "../types";

const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY ?? "");

export const createCheckoutSession = async (checkoutData: CheckoutData): Promise<string> => {
  const session = await stripe.checkout.sessions.create(checkoutData);
  return session.url
  // return session.client_secret
}