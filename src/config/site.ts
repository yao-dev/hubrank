const url = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://usehubrank.com";

export const siteConfig = {
  name: "Hubrank",
  short_description: "Generate SEO blogs, social media captions & replies in just few clicks.",
  description: "Grow 10x Faster with AI Content Marketing for Your Business. Boost your SEO, Create Social Captions & Replies and more.",
  url,
  locale: "en_US",
  keywords: [],
  og_url: `${url}/marketing/og-image.webp`,
  author: "@usehubrank"
}
