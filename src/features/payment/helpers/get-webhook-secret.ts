export const getWebhookSecret = (origin: string) => {
  // If you are testing your webhook locally with the Stripe CLI, you can find the
  // endpoint's secret by running `stripe listen`. Otherwise, find your
  // endpoint's secret in your webhook settings in the Developer Dashboard
  // This is your Stripe CLI webhook secret for testing your endpoint locally.
  const secrets = {
    localhost: process.env.STRIPE_WEBHOOK_LOCALHOST,
    test_mode: process.env.STRIPE_WEBHOOK_TEST,
    live_mode: process.env.STRIPE_WEBHOOK_LIVE,
  }

  let webhookSecret = secrets.test_mode;
  if (origin.includes("localhost")) {
    webhookSecret = secrets.localhost;
  }
  if (process.env.NODE_ENV === "production") {
    webhookSecret = secrets.live_mode;
  }

  return webhookSecret ?? "";
}