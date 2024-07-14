
import endpoints from "../../../../features/payment/endpoints";

export const maxDuration = 10;

const productIds = {
  starter: "prod_PX3l49am87ELev",
  growth: "prod_PX5569uBv4gEPI",
  business: "prod_PX57RVaevinnHf",
}

export async function GET() {
  return endpoints.products(Object.values(productIds))
}