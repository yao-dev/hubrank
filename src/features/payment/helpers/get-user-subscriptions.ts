const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY ?? "");

export const getUserSubscriptions = async (customerId: string) => {
  const subscriptions = await stripe.subscriptions.list({
    limit: 5,
    customer: customerId,
  });

  return subscriptions.data;
}
