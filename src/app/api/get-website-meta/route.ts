import axios from "axios";

export async function POST(request: Request) {
  const body = await request.json();
  const { data } = await axios.post(process.env.NEXT_PUBLIC_API_SCRAPE_WEBSITE_META || "", body);

  return Response.json(data)
}