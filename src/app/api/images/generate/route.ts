import { getAiImage } from "@/helpers/image";

export async function POST(request: Request) {
  const body = await request.json();
  const data = await getAiImage(body.query);
  return Response.json(data)
}