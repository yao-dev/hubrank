import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";

// export async function POST(request: Request) {
//   const body = await request.json()
//   // const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");
//   const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

//   let event
//   try {
//     // check stripe event signature
//     event = stripe.webhooks.constructEvent(
//       body.rawBody,
//       request.headers.get("stripe-signature") || "",
//       process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!
//     )
//   } catch (error) {
//     reportError(error, { request: req, details: "stripe-signature check error" }, req)
//     return res.status(400).send({ error })
//   }


//   return NextResponse.json({ ping: true })
// }

// This is your Stripe CLI webhook secret for testing your endpoint locally.
// const endpointSecret = "whsec_e07823e4087de630456b0c3b3f787306e544c0236797f61c2db852095612f17a"; // http://localhost:3000
// const endpointSecret = "whsec_YOr8AW25pMQMPw5kVqBQ9vZ5S2svjI4b"; // https://0d13-2a00-23c7-5c28-e301-e516-2d1a-759a-4249.ngrok-free.app/api/webhook

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!);
    event = stripe.webhooks.constructEvent(body, sig, process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_SIGNING_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ message: `Webhook Error: ${err?.message}` }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const checkoutSessionCompleted = event.data.object;
      console.log({ checkoutSessionCompleted })
    // Then define and call a function to handle the event customer.subscription.updated
    case 'customer.subscription.created':
      const customerSubscriptionCreated = event.data.object;
      console.log({ customerSubscriptionCreated })
      // Then define and call a function to handle the event customer.subscription.created
      break;
    case 'customer.subscription.deleted':
      const customerSubscriptionDeleted = event.data.object;
      console.log({ customerSubscriptionDeleted })
      // Then define and call a function to handle the event customer.subscription.deleted
      break;
    case 'customer.subscription.updated':
      const customerSubscriptionUpdated = event.data.object;
      console.log({ customerSubscriptionUpdated })
      // Then define and call a function to handle the event customer.subscription.updated
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  return NextResponse.json({ success: true }, { status: 200 })
}