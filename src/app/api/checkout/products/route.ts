
import endpoints from "@/features/payment/endpoints";

export const maxDuration = 10;

const productIds = {
  starter: process.env.NODE_ENV === "production" ? "prod_QTl8b1CxyL3Lkg" : "prod_PX3l49am87ELev",
  growth: process.env.NODE_ENV === "production" ? "prod_QTl8uiOYTiDBkY" : "prod_PX5569uBv4gEPI",
  business: process.env.NODE_ENV === "production" ? "prod_QTl8mEiOAnvDSW" : "prod_PX57RVaevinnHf",
}

export async function GET() {
  return endpoints.products(Object.values(productIds))
}