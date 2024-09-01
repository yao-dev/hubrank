import { siteConfig } from "@/config/site";
import { MetadataRoute } from "next";
import { keywords } from "./(marketing)/glossary/[keyword]/constants";
import { formSlugs } from "./(marketing)/tools/[keyword]/forms";
import { competitorList } from "@/options";

const getSitemapRoute = (path?: string) => {
  return {
    url: path ? `${siteConfig.url}${path.startsWith('/') ? path : `/${path}`}` : siteConfig.url ?? "",
    lastModified: new Date(),
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    getSitemapRoute(),
    getSitemapRoute("#features"),
    getSitemapRoute("#pricing"),
    // getSitemapRoute("/login"),
    // getSitemapRoute("/privacy-policy"),
    // getSitemapRoute("/terms-and-conditions"),
    getSitemapRoute("/glossary"),
    ...keywords.map((keyword) => getSitemapRoute(`/glossary/${keyword.slug}`)),
    ...formSlugs.map((keyword: string) => getSitemapRoute(`/tools/${keyword}`)),
    ...competitorList.map((competitor) => getSitemapRoute(`/alternatives/${competitor.slug}`)),
  ]
}