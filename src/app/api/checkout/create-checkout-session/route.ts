
import { NextRequest } from "next/server";
import endpoints from "../../../../features/payment/endpoints";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  return endpoints.createCheckoutSession(req)
}