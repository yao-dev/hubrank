import axios from "axios";
import { isEmpty, pick } from "lodash";
import cheerio from "cheerio";

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
    data: [{ search_partners: false, keywords: [keyword], language_code: countryCode || "en", sort_by: "relevance", date_interval: "next_month", include_adult_keywords: false }],
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

type DetailedSEOArticleCheck = {
  score: number;
  images: {
    total: number;
    list: {
      url: string;
      hasAlt: boolean;
    }[];
    missingAltList: string[];  // List of URLs for images missing alt text
  };
  videos: {
    total: number;
    list: string[];  // List of video URLs
  };
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
    h4: string[];
    multipleH1: boolean;  // True if there's more than one H1
  };
  links: {
    internal: {
      total: number;
      list: string[];  // List of internal links (URLs)
    };
    external: {
      total: number;
      list: string[];  // List of external links (URLs)
    };
  };
  meta: {
    description: string;
    keywords: string[];
    featuredImage: string;
  };
  keywords: {
    inSlug: boolean;
    inMetaDescription: boolean;
  };
  structuredData: string[];  // List of structured data entries
};


export const getSEOChecks = ({ html, keywords, url }: { html: string; keywords: string[]; url: string }): DetailedSEOArticleCheck => {
  const $ = cheerio.load(html);

  // Image check
  const images = $('img').map((_, img) => {
    const imageUrl = $(img).attr('src') || '';
    const hasAlt = !!$(img).attr('alt');
    return { url: imageUrl, hasAlt };
  }).get();

  const missingAltList = $('img').filter((_, img) => !$(img).attr('alt')).map((_, img) => $(img).attr('src') || '').get();

  // Video check
  const videos = $('video, link[src*="youtube.com"], link[src*="youtube-nocookie.com"], link[src*="vimeo.com"], iframe[src*="youtube.com"], iframe[src*="youtube-nocookie.com"], iframe[src*="vimeo.com"]').map((_, video) => {
    let src = $(video).attr('src') ?? '';

    if ($(video).attr('href')?.startsWith("https://www.youtube.com/watch?v=") || $(video).attr('href')?.startsWith("https://www.youtube.com/shorts")) {
      src = $(video).attr('href') ?? ""
    }

    return src
  }).get();

  // Headings check
  const h1 = $('h1').map((_, el) => $(el).text().trim()).get();
  const h2 = $('h2').map((_, el) => $(el).text().trim()).get();
  const h3 = $('h3').map((_, el) => $(el).text().trim()).get();
  const h4 = $('h4').map((_, el) => $(el).text().trim()).get();
  const multipleH1 = h1.length > 1;

  // Links check
  const internalLinks = $('a').filter((_, link) => {
    const href = $(link).attr('href') || '';
    // Consider as internal if it contains the hostname or is an anchor link
    return url && href.includes(new URL(url).hostname) || href.startsWith('#');
  }).map((_, link) => $(link).attr('href') || '').get();

  const externalLinks = $('a').filter((_, link) => {
    const href = $(link).attr('href') || '';
    // Consider as external if it doesn't contain the hostname and is not an anchor link
    return url && !href.includes(new URL(url).hostname) && !href.startsWith('#');
  }).map((_, link) => $(link).attr('href') || '').get();

  // Meta check
  const metaDescription = $('meta[name="description"]').attr('content') || '';
  const metaKeywords = $('meta[name="keywords"]').attr('content')?.split(',').map(keyword => keyword.trim()) || [];
  const ogImage = $('meta[property="og:image"]').attr('content') || '';

  // Keywords check
  const keywordsInSlug = keywords.some(keyword => url.includes(keyword));
  const keywordsInMetaDescription = keywords.some(keyword => metaDescription.includes(keyword));

  // Structured data check
  const structuredData = $('script[type="application/ld+json"]').map((_, script) => $(script).html() || '').get();

  // Calculate SEO Score out of 10
  let score = 0;
  const totalCriteria = 8; // Total number of criteria to check

  // Criteria checks
  if (images.length > 0) score += 1; // Images exist
  if (images.length > 0 && missingAltList.length === 0) score += 1; // All images have alt
  if (h1.length === 1) score += 1; // Exactly one H1
  if (h2.length > 0) score += 1; // At least one H2
  if (internalLinks.length > 0) score += 1; // At least one internal link
  if (externalLinks.length > 0) score += 1; // At least one external link
  if (metaDescription.length > 0) score += 1; // Meta description exists
  if (ogImage.length > 0) score += 1; // Featured image exists

  // Finalize the score (out of 10)
  const seoScore = Math.round((score / totalCriteria) * 10);

  return {
    score: seoScore,
    images: {
      total: images.length,
      list: images,
      missingAltList
    },
    videos: {
      total: videos.length,
      list: videos
    },
    headings: {
      h1,
      h2,
      h3,
      h4,
      multipleH1
    },
    links: {
      internal: {
        total: internalLinks.length,
        list: internalLinks
      },
      external: {
        total: externalLinks.length,
        list: externalLinks
      }
    },
    meta: {
      description: metaDescription,
      keywords: metaKeywords,
      featuredImage: ogImage
    },
    keywords: {
      inSlug: keywordsInSlug,
      inMetaDescription: keywordsInMetaDescription
    },
    structuredData
  };
}
