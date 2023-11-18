import axios from "axios";

export async function POST(request: Request) {
  const body = await request.json();
  const { data } = await axios.post(process.env.API_GENERATE_HEADLINES || "", body)

  return Response.json(data)
}