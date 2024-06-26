import { NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  if (
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.endsWith("5pgozwml3q-uc.a.run.app") ||
    request.nextUrl.href.startsWith("https://zapier.com/dashboard/auth/oauth/return/App199242CLIAPI/")
  ) {
    response.headers.append("Access-Control-Allow-Origin", "*")
  }

  return response
}