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

export const getRelatedKeywords = ({
  keyword,
  depth = 2,
  limit = 50
}: any) => {
  return dataforseo({
    method: "POST",
    url: "dataforseo_labs/google/related_keywords/live",
    data: [{ keyword, "location_code": 2840, "language_code": "en", depth, "include_seed_keyword": false, "include_serp_info": false, limit, "offset": 0 }],
  })
}


export const getSerpData = ({
  keyword,
  depth = 20,
}: any) => {
  return dataforseo({
    method: "POST",
    url: "serp/google/organic/live/advanced",
    data: [{ keyword, "location_code": 2826, "language_code": "en", "device": "desktop", "os": "windows", depth }],
  })
}