import { NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  console.log({
    url: request.url,
    nextUrl: request.nextUrl.pathname,
  })

  if (
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.endsWith("5pgozwml3q-uc.a.run.app") ||
    request.nextUrl.href.startsWith("https://zapier.com/dashboard/auth/oauth/return/App199242CLIAPI/")
  ) {
    response.headers.append("Access-Control-Allow-Origin", "*")
  }


  // res.headers.append('Access-Control-Allow-Credentials', "true");
  // res.headers.append('Access-Control-Allow-Origin', "*");
  // res.headers.append('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
  // res.headers.append('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  return response
}