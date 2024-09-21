import { stripeUrls } from "../constants"
import { GetCheckoutReturnUrl } from "../types"

export const getCheckoutReturnUrl = ({ origin, checkoutSessionId = "" }: GetCheckoutReturnUrl) => {
  return stripeUrls.RETURN_CHECKOUT
    .replace("ORIGIN", origin)
    .replace("CHECKOUT_SESSION_ID", checkoutSessionId)
}