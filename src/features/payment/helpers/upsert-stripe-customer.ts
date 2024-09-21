import supabase from "@/helpers/supabase/server";

const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY ?? "");

export const upsertStripeCustomer = async (userId: string) => {
  const { data: user } = await supabase().from('users').select().eq("id", userId).maybeSingle().throwOnError();
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
      await supabase().from("users").update({ customer_id: customer.id }).eq("id", userId).throwOnError();
      return customer;
    }

    return null;
  } catch {

  }
}