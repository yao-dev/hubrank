const url = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://usehubrank.com";

export const siteConfig = {
  name: "Hubrank",
  short_description: "Generate SEO blogs, social media captions & replies in just few clicks.",
  description: "Supercharge your marketing with AI-generated content. Create SEO blogs and social media posts instantly. Grow your brand 10x faster with no effort.",
  url,
  locale: "en_US",
  keywords: [],
  og_url: `${url}/marketing/og-image.webp`,
  author: "@usehubrank"
}
