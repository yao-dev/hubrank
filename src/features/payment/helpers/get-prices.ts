const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY ?? "");

export const getPrices = async (ids: string[]) => {
  const query = ids.map((id) => `product:"${id}"`).join(" OR ");
  const prices = await stripe.prices.search({
    query
  });
  return prices;
}