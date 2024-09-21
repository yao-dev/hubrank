import { NextRequest } from "next/server";
import { updateSession } from "./helpers/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request)
  // const response = NextResponse.next()

  // if (
  //   request.nextUrl.pathname.startsWith("/api") ||
  //   request.nextUrl.href.startsWith("https://zapier.com/dashboard/auth/oauth/return/App199242CLIAPI/")
  // ) {
  //   response.headers.append("Access-Control-Allow-Origin", "*")
  // }

  // return response
}

// export const config = {
//   matcher: "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
// }

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all files inside /public (not just root files)
     */
    "/((?!api/|_next/|_static/|_vercel|auth|public/|[\\w-]+\\.\\w+).*)",
  ],
};