import { getGoogleClient } from '@/app/api/search-console-auth-url/route';
import chalk from 'chalk';
import { NextResponse } from 'next/server';
// The client you created from the Server-Side Auth instructions

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  console.log(chalk.bgBlue(request.url))
  const oauth2Client = getGoogleClient(origin);
  const { tokens } = await oauth2Client.getToken(searchParams.get("code") ?? "");
  // oauth2Client.setCredentials(tokens)
  console.log(chalk.bgBlue(JSON.stringify(tokens, null, 2)));

  const hasIndexingScope = tokens.scope?.includes("https://www.googleapis.com/auth/indexing");
  const hasWebmasterScope = tokens.scope?.includes("https://www.googleapis.com/auth/webmasters");

  if (!hasIndexingScope || !hasWebmasterScope) {
    return NextResponse.redirect(new URL(`/analytics?error=permissions`, origin))
  }
  return NextResponse.redirect(new URL(`/analytics?access_token=${tokens.refresh_token}`, origin))
}