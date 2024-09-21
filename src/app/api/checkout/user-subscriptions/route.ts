
import endpoints from "@/features/payment/endpoints";
import { NextRequest } from "next/server";

export const maxDuration = 10;

export async function POST(req: NextRequest) {
  return endpoints.userSubscriptions(req)
}