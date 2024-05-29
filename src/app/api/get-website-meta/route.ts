import { fetchWebsiteMetadata } from "@/helpers/metadata";

export async function POST(request: Request) {
  const body = await request.json();
  // const { data } = await axios.post(process.env.NEXT_PUBLIC_API_SCRAPE_WEBSITE_META || "", body);
  const metatags = await fetchWebsiteMetadata(body.website)

  return Response.json(metatags)
}