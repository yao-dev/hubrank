import supabase from '@/helpers/supabase/server';
import chalk from 'chalk';
import { NextResponse } from 'next/server';
// The client you created from the Server-Side Auth instructions

export async function GET(request: Request) {
  const { searchParams, host } = new URL(request.url)
  const code = searchParams.get('code');

  console.log(chalk.bgBlue(request.url))

  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/';
  const hostname = `${process.env.NODE_ENV === "development" ? "http:" : "https:"}//app.${host}`;

  if (code) {
    const { error } = await supabase().auth.exchangeCodeForSession(code);

    if (!error) {
      console.log("next", next)
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        console.log("`${hostname}${next}`", `${hostname}${next}`)
        return NextResponse.redirect(`${hostname}${next}`)
      } else if (forwardedHost) {
        console.log("`https://app.${forwardedHost}${next}`", `https://app.${forwardedHost}${next}`)
        return NextResponse.redirect(`https://app.${forwardedHost}${next}`)
      } else {
        console.log("`${hostname}${next}`", `${hostname}${next}`)
        return NextResponse.redirect(`${hostname}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  console.log("`${hostname}/login`", `${hostname}/login`)
  return NextResponse.redirect(`${hostname}/login`)
}