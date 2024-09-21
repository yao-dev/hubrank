
import { NextRequest } from "next/server";
import endpoints from "@/features/payment/endpoints";

export const maxDuration = 10

export async function POST(req: NextRequest) {
  return endpoints.customerPortal(req);
}