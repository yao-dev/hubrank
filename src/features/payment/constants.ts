export const stripeUrls = {
  CUSTOMER_PORTAL: "/api/checkout/customer-portal",
  CREATE_CHECKOUT_SESSION: "/api/checkout/create-checkout-session",
  // NOT USED
  SESSION_STATUS: "/api/checkout/session-status?session_id=SESSION_ID&user_id=USER_ID",
  GET_PRODUCTS: "/api/checkout/products",
  GET_PRICES: "/api/checkout/prices",
  RETURN_CHECKOUT: "ORIGIN/subscriptions",
  // RETURN_CHECKOUT: "ORIGIN/subscriptions?session_id=CHECKOUT_SESSION_ID",
  USER_SUBSCRIPTIONS: "/api/checkout/user-subscriptions",
}

export const webhookEvents = {
  billing_portal_session_created: 'billing_portal.session.created',
  checkout_session_completed: 'checkout.session.completed',
  customer_updated: 'customer.updated',
  customer_subscription_created: 'customer.subscription.created',
  customer_subscription_deleted: 'customer.subscription.deleted',
  customer_subscription_updated: 'customer.subscription.updated',
  invoice_paid: 'invoice.paid',
  invoice_payment_failed: 'invoice.payment_failed',
}

export const currencies = {
  USD: {
    symbol: "$",
    decimal_digits: 2,
    code: "USD",
  },
  CAD: {
    symbol: "CA$",
    decimal_digits: 2,
    code: "CAD",
  },
  EUR: {
    symbol: "€",
    decimal_digits: 2,
    code: "EUR",
  },
  AED: {
    symbol: "AED",
    decimal_digits: 2,
    code: "AED",
  },
  AFN: {
    symbol: "Af",
    decimal_digits: 0,
    code: "AFN",
  },
  ALL: {
    symbol: "ALL",
    decimal_digits: 0,
    code: "ALL",
  },
  AMD: {
    symbol: "AMD",
    decimal_digits: 0,
    code: "AMD",
  },
  ARS: {
    symbol: "AR$",
    decimal_digits: 2,
    code: "ARS",
  },
  AUD: {
    symbol: "AU$",
    decimal_digits: 2,
    code: "AUD",
  },
  AZN: {
    symbol: "man.",
    decimal_digits: 2,
    code: "AZN",
  },
  BAM: {
    symbol: "KM",
    decimal_digits: 2,
    code: "BAM",
  },
  BDT: {
    symbol: "Tk",
    decimal_digits: 2,
    code: "BDT",
  },
  BGN: {
    symbol: "BGN",
    decimal_digits: 2,
    code: "BGN",
  },
  BHD: {
    symbol: "BD",
    decimal_digits: 3,
    code: "BHD",
  },
  BIF: {
    symbol: "FBu",
    decimal_digits: 0,
    code: "BIF",
  },
  BND: {
    symbol: "BN$",
    decimal_digits: 2,
    code: "BND",
  },
  BOB: {
    symbol: "Bs",
    decimal_digits: 2,
    code: "BOB",
  },
  BRL: {
    symbol: "R$",
    decimal_digits: 2,
    code: "BRL",
  },
  BWP: {
    symbol: "BWP",
    decimal_digits: 2,
    code: "BWP",
  },
  BYN: {
    symbol: "Br",
    decimal_digits: 2,
    code: "BYN",
  },
  BZD: {
    symbol: "BZ$",
    decimal_digits: 2,
    code: "BZD",
  },
  CDF: {
    symbol: "CDF",
    decimal_digits: 2,
    code: "CDF",
  },
  CHF: {
    symbol: "CHF",
    decimal_digits: 2,
    rounding: 0.05,
    code: "CHF",
  },
  CLP: {
    symbol: "CL$",
    decimal_digits: 0,
    code: "CLP",
  },
  CNY: {
    symbol: "CN¥",
    decimal_digits: 2,
    code: "CNY",
  },
  COP: {
    symbol: "CO$",
    decimal_digits: 0,
    code: "COP",
  },
  CRC: {
    symbol: "₡",
    decimal_digits: 0,
    code: "CRC",
  },
  CVE: {
    symbol: "CV$",
    decimal_digits: 2,
    code: "CVE",
  },
  CZK: {
    symbol: "Kč",
    decimal_digits: 2,
    code: "CZK",
  },
  DJF: {
    symbol: "Fdj",
    decimal_digits: 0,
    code: "DJF",
  },
  DKK: {
    symbol: "Dkr",
    decimal_digits: 2,
    code: "DKK",
  },
  DOP: {
    symbol: "RD$",
    decimal_digits: 2,
    code: "DOP",
  },
  DZD: {
    symbol: "DA",
    decimal_digits: 2,
    code: "DZD",
  },
  EEK: {
    symbol: "Ekr",
    decimal_digits: 2,
    code: "EEK",
  },
  EGP: {
    symbol: "EGP",
    decimal_digits: 2,
    code: "EGP",
  },
  ERN: {
    symbol: "Nfk",
    decimal_digits: 2,
    code: "ERN",
  },
  ETB: {
    symbol: "Br",
    decimal_digits: 2,
    code: "ETB",
  },
  GBP: {
    symbol: "£",
    decimal_digits: 2,
    code: "GBP",
  },
  GEL: {
    symbol: "GEL",
    decimal_digits: 2,
    code: "GEL",
  },
  GHS: {
    symbol: "GH₵",
    decimal_digits: 2,
    code: "GHS",
  },
  GNF: {
    symbol: "FG",
    decimal_digits: 0,
    code: "GNF",
  },
  GTQ: {
    symbol: "GTQ",
    decimal_digits: 2,
    code: "GTQ",
  },
  HKD: {
    symbol: "HK$",
    decimal_digits: 2,
    code: "HKD",
  },
  HNL: {
    symbol: "HNL",
    decimal_digits: 2,
    code: "HNL",
  },
  HRK: {
    symbol: "kn",
    decimal_digits: 2,
    code: "HRK",
  },
  HUF: {
    symbol: "Ft",
    decimal_digits: 0,
    code: "HUF",
  },
  IDR: {
    symbol: "Rp",
    decimal_digits: 0,
    code: "IDR",
  },
  ILS: {
    symbol: "₪",
    decimal_digits: 2,
    code: "ILS",
  },
  INR: {
    symbol: "Rs",
    decimal_digits: 2,
    code: "INR",
  },
  IQD: {
    symbol: "IQD",
    decimal_digits: 0,
    code: "IQD",
  },
  IRR: {
    symbol: "IRR",
    decimal_digits: 0,
    code: "IRR",
  },
  ISK: {
    symbol: "Ikr",
    decimal_digits: 0,
    code: "ISK",
  },
  JMD: {
    symbol: "J$",
    decimal_digits: 2,
    code: "JMD",
  },
  JOD: {
    symbol: "JD",
    decimal_digits: 3,
    code: "JOD",
  },
  JPY: {
    symbol: "¥",
    decimal_digits: 0,
    code: "JPY",
  },
  KES: {
    symbol: "Ksh",
    decimal_digits: 2,
    code: "KES",
  },
  KHR: {
    symbol: "KHR",
    decimal_digits: 2,
    code: "KHR",
  },
  KMF: {
    symbol: "CF",
    decimal_digits: 0,
    code: "KMF",
  },
  KRW: {
    symbol: "₩",
    decimal_digits: 0,
    code: "KRW",
  },
  KWD: {
    symbol: "KD",
    decimal_digits: 3,
    code: "KWD",
  },
  KZT: {
    symbol: "KZT",
    decimal_digits: 2,
    code: "KZT",
  },
  LBP: {
    symbol: "L.L.",
    decimal_digits: 0,
    code: "LBP",
  },
  LKR: {
    symbol: "SLRs",
    decimal_digits: 2,
    code: "LKR",
  },
  LTL: {
    symbol: "Lt",
    decimal_digits: 2,
    code: "LTL",
  },
  LVL: {
    symbol: "Ls",
    decimal_digits: 2,
    code: "LVL",
  },
  LYD: {
    symbol: "LD",
    decimal_digits: 3,
    code: "LYD",
  },
  MAD: {
    symbol: "MAD",
    decimal_digits: 2,
    code: "MAD",
  },
  MDL: {
    symbol: "MDL",
    decimal_digits: 2,
    code: "MDL",
  },
  MGA: {
    symbol: "MGA",
    decimal_digits: 0,
    code: "MGA",
  },
  MKD: {
    symbol: "MKD",
    decimal_digits: 2,
    code: "MKD",
  },
  MMK: {
    symbol: "MMK",
    decimal_digits: 0,
    code: "MMK",
  },
  MOP: {
    symbol: "MOP$",
    decimal_digits: 2,
    code: "MOP",
  },
  MUR: {
    symbol: "MURs",
    decimal_digits: 0,
    code: "MUR",
  },
  MXN: {
    symbol: "MX$",
    decimal_digits: 2,
    code: "MXN",
  },
  MYR: {
    symbol: "RM",
    decimal_digits: 2,
    code: "MYR",
  },
  MZN: {
    symbol: "MTn",
    decimal_digits: 2,
    code: "MZN",
  },
  NAD: {
    symbol: "N$",
    decimal_digits: 2,
    code: "NAD",
  },
  NGN: {
    symbol: "₦",
    decimal_digits: 2,
    code: "NGN",
  },
  NIO: {
    symbol: "C$",
    decimal_digits: 2,
    code: "NIO",
  },
  NOK: {
    symbol: "Nkr",
    decimal_digits: 2,
    code: "NOK",
  },
  NPR: {
    symbol: "NPRs",
    decimal_digits: 2,
    code: "NPR",
  },
  NZD: {
    symbol: "NZ$",
    decimal_digits: 2,
    code: "NZD",
  },
  OMR: {
    symbol: "OMR",
    decimal_digits: 3,
    code: "OMR",
  },
  PAB: {
    symbol: "B/.",
    decimal_digits: 2,
    code: "PAB",
  },
  PEN: {
    symbol: "S/.",
    decimal_digits: 2,
    code: "PEN",
  },
  PHP: {
    symbol: "₱",
    decimal_digits: 2,
    code: "PHP",
  },
  PKR: {
    symbol: "PKRs",
    decimal_digits: 0,
    code: "PKR",
  },
  PLN: {
    symbol: "zł",
    decimal_digits: 2,
    code: "PLN",
  },
  PYG: {
    symbol: "₲",
    decimal_digits: 0,
    code: "PYG",
  },
  QAR: {
    symbol: "QR",
    decimal_digits: 2,
    code: "QAR",
  },
  RON: {
    symbol: "RON",
    decimal_digits: 2,
    code: "RON",
  },
  RSD: {
    symbol: "din.",
    decimal_digits: 0,
    code: "RSD",
  },
  RUB: {
    symbol: "RUB",
    decimal_digits: 2,
    code: "RUB",
  },
  RWF: {
    symbol: "RWF",
    decimal_digits: 0,
    code: "RWF",
  },
  SAR: {
    symbol: "SR",
    decimal_digits: 2,
    code: "SAR",
  },
  SDG: {
    symbol: "SDG",
    decimal_digits: 2,
    code: "SDG",
  },
  SEK: {
    symbol: "Skr",
    decimal_digits: 2,
    code: "SEK",
  },
  SGD: {
    symbol: "S$",
    decimal_digits: 2,
    code: "SGD",
  },
  SOS: {
    symbol: "Ssh",
    decimal_digits: 0,
    code: "SOS",
  },
  SYP: {
    symbol: "SY£",
    decimal_digits: 0,
    code: "SYP",
  },
  THB: {
    symbol: "฿",
    decimal_digits: 2,
    code: "THB",
  },
  TND: {
    symbol: "DT",
    decimal_digits: 3,
    code: "TND",
  },
  TOP: {
    symbol: "T$",
    decimal_digits: 2,
    code: "TOP",
  },
  TRY: {
    symbol: "TL",
    decimal_digits: 2,
    code: "TRY",
  },
  TTD: {
    symbol: "TT$",
    decimal_digits: 2,
    code: "TTD",
  },
  TWD: {
    symbol: "NT$",
    decimal_digits: 2,
    code: "TWD",
  },
  TZS: {
    symbol: "TSh",
    decimal_digits: 0,
    code: "TZS",
  },
  UAH: {
    symbol: "₴",
    decimal_digits: 2,
    code: "UAH",
  },
  UGX: {
    symbol: "USh",
    decimal_digits: 0,
    code: "UGX",
  },
  UYU: {
    symbol: "$U",
    decimal_digits: 2,
    code: "UYU",
  },
  UZS: {
    symbol: "UZS",
    decimal_digits: 0,
    code: "UZS",
  },
  VEF: {
    symbol: "Bs.F.",
    decimal_digits: 2,
    code: "VEF",
  },
  VND: {
    symbol: "₫",
    decimal_digits: 0,
    code: "VND",
  },
  XAF: {
    symbol: "FCFA",
    decimal_digits: 0,
    code: "XAF",
  },
  XOF: {
    symbol: "CFA",
    decimal_digits: 0,
    code: "XOF",
  },
  YER: {
    symbol: "YR",
    decimal_digits: 0,
    code: "YER",
  },
  ZAR: {
    symbol: "R",
    decimal_digits: 2,
    code: "ZAR",
  },
  ZMK: {
    symbol: "ZK",
    decimal_digits: 0,
    code: "ZMK",
  },
  ZWL: {
    symbol: "ZWL$",
    decimal_digits: 0,
    code: "ZWL",
  }
}