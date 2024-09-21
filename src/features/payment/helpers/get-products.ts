const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY ?? "");

// Product ids are prefixed with "prod_" like "prod_PwY2NE"
export const getProducts = async (ids: string[]) => {
  const products = await stripe.products.list({
    ids
  });
  return products
}