import { SessionStatus } from "../types";

const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY ?? "");

export const getSessionStatus = async (sessionId: string): Promise<SessionStatus> => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return {
    status: session.status,
    customerEmail: session.customer_details.email
  }
}