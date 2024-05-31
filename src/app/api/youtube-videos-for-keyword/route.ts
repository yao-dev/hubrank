import { getYoutubeVideosForKeyword } from "../helpers";

export async function POST(request: Request) {
  const body = await request.json();
  const data = await getYoutubeVideosForKeyword({
    keyword: body.keyword,
    languageCode: body.languageCode,
    locationCode: body.locationCode,
  });

  return Response.json(data)
}