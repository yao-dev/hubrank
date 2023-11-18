import { NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  if (request.nextUrl.pathname.startsWith("/api") || request.nextUrl.pathname.endsWith("5pgozwml3q-uc.a.run.app")) {
    response.headers.append("Access-Control-Allow-Origin", "*")
  }

  return response
}