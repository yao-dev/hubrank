import { siteConfig } from "@/config/site";
import { MetadataRoute } from "next";
import { keywords } from "./(marketing)/glossary/[keyword]/constants";

const getSitemapRoute = (url: string) => {
  return {
    url,
    lastModified: new Date(),
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    getSitemapRoute(siteConfig.url),
    getSitemapRoute(`${siteConfig.url}#features`),
    getSitemapRoute(`${siteConfig.url}#pricing`),
    getSitemapRoute(`${siteConfig.url}/login`),
    getSitemapRoute(`${siteConfig.url}/privacy-policy`),
    getSitemapRoute(`${siteConfig.url}/terms-and-conditions`),
    getSitemapRoute(`${siteConfig.url}/glossary`),
    ...keywords.map((keyword) => getSitemapRoute(`${siteConfig.url}/glossary/${keyword.slug}`))
  ]
}