import axios from "axios";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data } = await axios.post(process.env.API_HEADING_IDEAS, body)

    return Response.json(data)
  } catch (e) {
    Response.json({ error: e })
  }
}