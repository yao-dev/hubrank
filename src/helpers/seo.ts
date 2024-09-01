import axios from "axios";
import { isEmpty, pick } from "lodash";

const dataforseo = axios.create({
  baseURL: 'https://api.dataforseo.com/v3/',
  auth: {
    username: process.env.DATAFORSEO_USERNAME || "",
    password: process.env.DATAFORSEO_PASSWORD || ""
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

  return data?.tasks?.[0]?.result?.[0]?.items ?? []
}


// export const getSerpData = ({
//   keyword,
//   depth = 20,
//   lang = "en",
//   location_code = 2840
// }: any) => {
//   return dataforseo({
//     method: "POST",
//     url: "serp/google/organic/live/advanced",
//     data: [{ keyword, "location_code": location_code, "language_code": lang, "device": "desktop", "os": "windows", depth }],
//   })
// }

export const getKeywordsForKeywords = async ({
  keyword,
  countryCode,
}: any) => {
  const { data } = await axios({
    method: "POST",
    url: "https://api.dataforseo.com/v3/keywords_data/google/keywords_for_keywords/live",
    data: [{ "search_partners": false, "keywords": [keyword], "language_code": countryCode || "en", "sort_by": "relevance", "date_interval": "next_month", "include_adult_keywords": false }],
    auth: {
      username: process.env.DATAFORSEO_USERNAME || "",
      password: process.env.DATAFORSEO_PASSWORD || ""
    },
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (isEmpty(data.tasks[0].result)) {
    return {
      result: [],
      result_count: 0,
      keywords: []
    }
  }

  return {
    result: data.tasks[0].result,
    result_count: data.tasks[0].result_count,
    keywords: data.tasks[0].result.map((i) => i.keyword)
  }
}

export const getSerp = async ({
  query,
  languageCode,
  locationCode,
  count = 5
}: any) => {
  const { data } = await axios({
    method: "POST",
    url: 'https://api.dataforseo.com/v3/serp/google/organic/live/advanced',
    data: [{
      keyword: query,
      location_code: locationCode,
      language_code: languageCode,
      device: 'desktop',
      os: 'windows',
      depth: 10,
    }],
    auth: {
      username: process.env.DATAFORSEO_USERNAME || "",
      password: process.env.DATAFORSEO_PASSWORD || ""
    },
    headers: {
      "Content-Type": "application/json"
    }
  });

  return (data?.tasks?.[0]?.result?.[0]?.items ?? []).filter((item) => item.type === "organic").slice(0, count).map((item) => pick(item, ["title", "description", "url"]));
}


export const getCompetitors = async (websiteUrl: string) => {
  const { data } = await dataforseo({
    method: "POST",
    url: "https://api.dataforseo.com/v3/backlinks/competitors/live",
    data: [{ target: new URL(websiteUrl).host, limit: 20, exclude_internal_backlinks: true, exclude_large_domains: true, main_domain: true }],
  });

  console.log(data)

  return data?.tasks?.[0]?.result?.[0]?.items ?? []
}

export const getWebsiteKeywords = async (websiteUrl: string) => {
  const { data } = await dataforseo({
    method: "POST",
    url: "https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_site/live",
    data: [{ target: websiteUrl, sort_by: "relevance" }],
  });

  const result = data?.tasks?.[0]?.result?.map((item) => pick(item, ["keyword", "competition", "competition_index", "search_volume"])) ?? []
  return result
}