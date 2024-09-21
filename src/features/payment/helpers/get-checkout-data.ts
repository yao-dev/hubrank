import { CheckoutData, GetCheckoutData } from "../types"
import { getCheckoutReturnUrl } from "./get-checkout-return-url"

export const getCheckoutData = ({
  priceId,
  metadata,
  customerId,
  customerEmail,
  origin,
  referral
}: GetCheckoutData): CheckoutData => {
  if (customerId) {
    return {
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      // ui_mode: 'embedded',
      success_url: getCheckoutReturnUrl({ origin }), // NOTE: ?success=true
      cancel_url: getCheckoutReturnUrl({ origin }), // NOTE: add ?canceled=true
      automatic_tax: { enabled: true },
      customer: customerId,
      customer_update: {
        address: 'auto',
      },
      metadata: {
        ...(metadata ?? {}),
        promotekit_referral: referral,
      },
    }
  }
  return {
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    // ui_mode: 'embedded',
    success_url: getCheckoutReturnUrl({ origin }), // NOTE: ?success=true
    cancel_url: getCheckoutReturnUrl({ origin }), // NOTE: add ?canceled=true
    automatic_tax: { enabled: true },
    customer_email: customerEmail,
    metadata: {
      ...(metadata ?? {}),
      promotekit_referral: referral,
    },
  }
}