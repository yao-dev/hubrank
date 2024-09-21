
import endpoints from "@/features/payment/endpoints";
import { NextRequest } from "next/server";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  return endpoints.createCheckoutSession(req)
}