import { getKeywordsForKeywords } from "@/helpers/seo";

export async function POST(request: Request) {
  const body = await request.json();
  const data = await getKeywordsForKeywords({
    keyword: body.keyword,
    countryCode: body.countryCode
  });

  return Response.json(data)
}