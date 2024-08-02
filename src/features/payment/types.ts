export type CheckoutData = {
  line_items: {
    price: string;
    quantity: number,
  }[];
  mode: "payment" | "subscription";
  // ui_mode: "embedded";
  success_url: string;
  cancel_url: string;
  automatic_tax: {
    enabled: boolean;
  },
  metadata: any;
  customer: string;
} | {
  line_items: {
    price: string;
    quantity: number,
  }[];
  mode: "payment" | "subscription";
  // ui_mode: "embedded";
  success_url: string;
  cancel_url: string;
  automatic_tax: {
    enabled: boolean;
  },
  metadata: any;
  customer_email: string;
}

export type GetCheckoutData = {
  priceId: string;
  metadata: any;
  customerId: string;
  origin: string;
} | {
  priceId: string;
  metadata: any;
  customerEmail: string;
  origin: string;
}

export type GetSessionStatusUrl = {
  sessionId: string;
  userId: string;
}

export type ClientSecret = string;

export type GetCustomerPortalUrl = {
  customerId: string;
  origin: string;
}

export type SessionStatus = {
  status: string;
  customerEmail: string;
}

export type GetWebhookEvent = {
  stripeSignature: string;
  webhookSecret: string;
  webhookValue: string;
}

type CheckoutSessionData = {
  mode: string
  payment_status: string;
  status: string;
  metadata: {
    user_id: string;
    credits: string;
  }
}

export type HandleWebhookEvent = {
  type: string;
  data: {
    object: CheckoutSessionData
  }
}

export type GetCheckoutReturnUrl = {
  origin: string;
  checkoutSessionId?: string;
}