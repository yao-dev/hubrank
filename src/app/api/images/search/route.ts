import { getImages } from "@/helpers/image";

export async function POST(request: Request) {
  const body = await request.json();
  const data = await getImages(body.query, body.count);
  return Response.json(data)
}