import { stripeUrls } from "../constants";
import { GetCheckoutReturnUrl } from "../types";

export const getCheckoutReturnUrl = ({ checkoutSessionId = "", success }: GetCheckoutReturnUrl = {}) => {
  const origin = `${process.env.NODE_ENV === "development" ? "http://app.localhost:3000" : "https://app.usehubrank.com"}`;
  return success ? `${origin}${stripeUrls.CHECKOUT_SUCCESS}` : `${origin}${stripeUrls.CHECKOUT_CANCELED}`



}