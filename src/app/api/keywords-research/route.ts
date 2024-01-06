import axios from "axios";

export async function POST(request: Request) {
  const body = await request.json();
  const { data } = await axios({
    method: "POST",
    url: "https://api.dataforseo.com/v3/keywords_data/google/keywords_for_keywords/live",
    data: [{ "search_partners": false, "keywords": [body.keyword], "language_code": body.countryCode || "en", "sort_by": "relevance", "date_interval": "next_month", "include_adult_keywords": false }],
    auth: {
      username: process.env.NEXT_PUBLIC_DATAFORSEO_USERNAME || "",
      password: process.env.NEXT_PUBLIC_DATAFORSEO_PASSWORD || ""
    },
    headers: {
      "Content-Type": "application/json"
    }
  });

  return Response.json({
    result: data.tasks[0].result,
    result_count: data.tasks[0].result_count,
  })
}