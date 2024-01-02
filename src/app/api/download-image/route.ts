import axios from "axios";

export async function POST(request: Request) {
  const body = await request.json();
  const { data } = await axios.post(process.env.NEXT_PUBLIC_API_ISTOCK_DOWNLOADER || "", body);

  console.log(data)

  return Response.json({
    ...data,
    keyword: body.keyword
  })
}