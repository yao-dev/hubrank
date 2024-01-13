import axios from "axios";

const dataforseo = axios.create({
  baseURL: 'https://api.dataforseo.com/v3/',
  auth: {
    username: process.env.NEXT_PUBLIC_DATAFORSEO_USERNAME || "",
    password: process.env.NEXT_PUBLIC_DATAFORSEO_PASSWORD || ""
  },
  headers: {
    "Content-Type": "application/json"
  }
});

export const getRelatedKeywords = async ({
  keyword,
  depth = 2,
  limit = 50,
  api = false,
  lang = "en",
  location_code = 2840
}: any) => {
  if (api) {
    return dataforseo({
      method: "POST",
      url: "dataforseo_labs/google/related_keywords/live",
      data: [{ keyword, "location_code": location_code, "language_code": lang, depth, "include_seed_keyword": false, "include_serp_info": false, limit, "offset": 0 }],
    })
  }

  const { data } = await dataforseo({
    method: "POST",
    url: "dataforseo_labs/google/related_keywords/live",
    data: [{ keyword, "location_code": location_code, "language_code": lang, depth, "include_seed_keyword": false, "include_serp_info": false, limit, "offset": 0 }],
  });

  return data?.tasks?.[0]?.result?.[0]?.items
}


export const getSerpData = ({
  keyword,
  depth = 20,
  lang = "en",
  location_code = 2840
}: any) => {
  return dataforseo({
    method: "POST",
    url: "serp/google/organic/live/advanced",
    data: [{ keyword, "location_code": location_code, "language_code": lang, "device": "desktop", "os": "windows", depth }],
  })
}