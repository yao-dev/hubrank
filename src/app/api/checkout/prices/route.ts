
import endpoints from "../../../../features/payment/endpoints";

export const maxDuration = 10;

export async function POST(request: Request) {
  return endpoints.prices(request)
}