import { orderBy } from "lodash";

export const keywordsMap = {
  seo: {
    keyword: "SEO",
    definition: "Search Engine Optimization, a strategy for improving the visibility of a website in search engine results."
  },
  keywords: {
    keyword: "Keywords",
    definition: "Words or phrases that describe the content on a page, used by search engines to match search queries."
  },
  "on-page-seo": {
    keyword: "On-Page SEO",
    definition: "The practice of optimizing individual web pages to rank higher in search engines, including content, HTML, and meta tags."
  },
  "off-page-seo": {
    keyword: "Off-Page SEO",
    definition: "Actions taken outside of your website to impact your rankings, such as link building, social media marketing, and influencer outreach."
  },
  "technical-seo": {
    keyword: "Technical SEO",
    definition: "The process of optimizing a website's technical aspects to improve its rankings, including site speed, mobile-friendliness, and crawlability."
  },
  backlinks: {
    keyword: "Backlinks",
    definition: "Links from one website to a page on another website, important for SEO as they represent a vote of confidence in your content."
  },
  "link-building": {
    keyword: "Link Building",
    definition: "The process of acquiring backlinks from other websites to improve your site's authority and search engine ranking."
  },
  "domain-authority": {
    keyword: "Domain Authority (DA)",
    definition: "A metric developed by Moz that predicts how well a website will rank on search engine result pages (SERPs)."
  },
  "page-authority": {
    keyword: "Page Authority (PA)",
    definition: "A metric developed by Moz that predicts how well a specific page will rank on search engine result pages (SERPs)."
  },
  "google-algorithm": {
    keyword: "Google Algorithm",
    definition: "A complex system used by Google to retrieve data from its search index and instantly deliver the best possible results for a query."
  },
  "organic-traffic": {
    keyword: "Organic Traffic",
    definition: "Visitors who land on your website from unpaid search engine results."
  },
  serp: {
    keyword: "SERP",
    definition: "Search Engine Results Page, the page displayed by a search engine in response to a user's query."
  },
  "meta-title": {
    keyword: "Meta Title",
    definition: "The title of a web page, displayed on the SERP and in the browser's title bar, used by search engines to understand the page's content."
  },
  "meta-description": {
    keyword: "Meta Description",
    definition: "A brief summary of a web page's content, displayed on the SERP under the title, used to entice users to click on your link."
  },
  "alt-text": {
    keyword: "Alt Text",
    definition: "Alternative text used in HTML to describe the content of an image, important for SEO and accessibility."
  },
  "anchor-text": {
    keyword: "Anchor Text",
    definition: "The clickable text in a hyperlink, important for SEO as it gives context to the linked page."
  },
  "schema-markup": {
    keyword: "Schema Markup",
    definition: "Code that you put on your website to help search engines return more informative results for users, enhancing rich snippets."
  },
  "canonical-tags": {
    keyword: "Canonical Tags",
    definition: "HTML elements that help prevent duplicate content issues by specifying the 'preferred' version of a web page."
  },
  "robots-txt": {
    keyword: "Robots.txt",
    definition: "A file used to instruct search engine robots which pages on your site to crawl and which to avoid."
  },
  "xml-sitemap": {
    keyword: "XML Sitemap",
    definition: "A file that lists all the pages of your website, helping search engines index your content more effectively."
  },
  "search-intent": {
    keyword: "Search Intent",
    definition: "The purpose behind a user's query, such as finding information, making a purchase, or navigating to a specific website."
  },
  "bounce-rate": {
    keyword: "Bounce Rate",
    definition: "The percentage of visitors who leave a website after viewing only one page, often used as a measure of content engagement."
  },
  ctr: {
    keyword: "CTR",
    definition: "Click-Through Rate, the percentage of people who click on a link after seeing it in search results or advertisements."
  },
  rankbrain: {
    keyword: "RankBrain",
    definition: "A machine learning-based component of Google's search algorithm that helps to process search queries."
  },
  "featured-snippets": {
    keyword: "Featured Snippets",
    definition: "Highlighted excerpts of content displayed at the top of Google's search results, often in response to a question."
  },
  "keyword-density": {
    keyword: "Keyword Density",
    definition: "The percentage of times a keyword appears on a page compared to the total word count, important for SEO."
  },
  "keyword-research": {
    keyword: "Keyword Research",
    definition: "The process of finding and analyzing search terms that people enter into search engines, used for SEO and content creation."
  },
  "lsi-keywords": {
    keyword: "LSI Keywords",
    definition: "Latent Semantic Indexing keywords, related terms or phrases that help search engines understand the content of a page."
  },
  "long-tail-keywords": {
    keyword: "Long-Tail Keywords",
    definition: "Longer and more specific keyword phrases that visitors are more likely to use when they’re closer to making a purchase or finding the information they need."
  },
  "keyword-stuffing": {
    keyword: "Keyword Stuffing",
    definition: "The practice of overloading a webpage with keywords in an attempt to manipulate a site's ranking in search results."
  },
  "black-hat-seo": {
    keyword: "Black Hat SEO",
    definition: "Unethical SEO practices that violate search engine guidelines and can lead to penalties, such as keyword stuffing and cloaking."
  },
  "white-hat-seo": {
    keyword: "White Hat SEO",
    definition: "Ethical SEO practices that follow search engine guidelines, focusing on providing value to users."
  },
  "grey-hat-seo": {
    keyword: "Grey Hat SEO",
    definition: "SEO practices that fall somewhere between ethical and unethical, not explicitly disallowed by search engines but still risky."
  },
  "content-optimization": {
    keyword: "Content Optimization",
    definition: "The process of improving content to ensure it reaches the largest possible audience, often through SEO techniques."
  },
  "content-clusters": {
    keyword: "Content Clusters",
    definition: "A content strategy that involves creating a series of related articles or posts that link to a central hub page, improving SEO."
  },
  "mobile-optimization": {
    keyword: "Mobile Optimization",
    definition: "The process of ensuring that a website works well on mobile devices, important for both user experience and SEO."
  },
  "local-seo": {
    keyword: "Local SEO",
    definition: "The practice of optimizing a website to rank better for local searches, often involving Google My Business and location-based keywords."
  },
  "page-speed": {
    keyword: "Page Speed",
    definition: "The time it takes for a web page to load, a crucial factor in user experience and SEO."
  },
  "google-search-console": {
    keyword: "Google Search Console",
    definition: "A free tool from Google that helps you monitor, maintain, and troubleshoot your site’s presence in Google Search results."
  },
  "core-web-vitals": {
    keyword: "Core Web Vitals",
    definition: "A set of metrics related to speed, responsiveness, and visual stability, used by Google to assess user experience."
  },
  "e-a-t": {
    keyword: "E-A-T",
    definition: "Expertise, Authoritativeness, and Trustworthiness, factors used by Google to evaluate the quality of content."
  },
  https: {
    keyword: "HTTPS",
    definition: "HyperText Transfer Protocol Secure, a secure version of HTTP, important for protecting user data and improving SEO."
  },
  indexing: {
    keyword: "Indexing",
    definition: "The process by which search engines store and organize content from the web to provide relevant results to users."
  },
  crawling: {
    keyword: "Crawling",
    definition: "The process by which search engine bots discover and scan web pages to include in their index."
  },
  "seo-audit": {
    keyword: "SEO Audit",
    definition: "A comprehensive analysis of a website's SEO factors to identify strengths, weaknesses, and opportunities for improvement."
  },
  "duplicate-content": {
    keyword: "Duplicate Content",
    definition: "Content that appears on the internet in more than one place, which can negatively impact search rankings."
  },
  "seo-friendly-urls": {
    keyword: "SEO-Friendly URLs",
    definition: "URLs that are designed to be easily readable by humans and search engines, often including keywords."
  },
  "html-headings": {
    keyword: "HTML Headings",
    definition: "Tags (H1-H6) used to define headings in HTML, important for content structure and SEO."
  },
  "structured-data": {
    keyword: "Structured Data",
    definition: "Organized data that helps search engines understand the content on a web page, often used for rich snippets."
  },
  "google-analytics": {
    keyword: "Google Analytics",
    definition: "A web analytics service offered by Google that tracks and reports website traffic, helping to measure SEO performance."
  },
  "position-zero": {
    keyword: "Position Zero",
    definition: "A term used to describe the topmost position in Google's search results, typically occupied by a featured snippet."
  },
  "user-experience": {
    keyword: "User Experience (UX)",
    definition: "The overall experience a person has when interacting with a website, important for engagement and SEO."
  },
  "dwell-time": {
    keyword: "Dwell Time",
    definition: "The amount of time a user spends on a page before returning to the search results, a potential ranking factor."
  },
  "time-on-page": {
    keyword: "Time on Page",
    definition: "The average amount of time users spend on a specific page, used to measure content engagement."
  },
  "hreflang-tags": {
    keyword: "Hreflang Tags",
    definition: "HTML tags that tell search engines which language you are using on a specific page, important for international SEO."
  },
  pagination: {
    keyword: "Pagination",
    definition: "The process of dividing content across multiple pages, often used for blogs and archives, with SEO implications."
  },
  "thin-content": {
    keyword: "Thin Content",
    definition: "Web pages with little or no valuable content, often penalized by search engines."
  },
  "internal-linking": {
    keyword: "Internal Linking",
    definition: "Links that point to other pages on the same website, helping to distribute page authority and improve SEO."
  },
  "external-linking": {
    keyword: "External Linking",
    definition: "Links that point to pages on a different website, used to reference sources and improve SEO."
  },
  "keyword-cannibalization": {
    keyword: "Keyword Cannibalization",
    definition: "When multiple pages on a website compete for the same keyword, potentially harming SEO performance."
  },
  "voice-search-optimization": {
    keyword: "Voice Search Optimization",
    definition: "The process of optimizing content to rank well in searches made via voice assistants like Siri and Alexa."
  },
  "search-volume": {
    keyword: "Search Volume",
    definition: "The number of searches for a specific keyword or phrase within a given timeframe, important for keyword research."
  },
  "crawl-budget": {
    keyword: "Crawl Budget",
    definition: "The number of pages a search engine will crawl on your site during a given timeframe, influenced by site structure and content freshness."
  },
  "google-penalty": {
    keyword: "Google Penalty",
    definition: "A negative impact on a website's search rankings due to violations of Google's Webmaster Guidelines."
  },
  "domain-age": {
    keyword: "Domain Age",
    definition: "The length of time a domain has existed, often considered a factor in SEO and trustworthiness."
  },
  "image-optimization": {
    keyword: "Image Optimization",
    definition: "The process of reducing image file sizes, using descriptive filenames, and adding alt text to improve page load speed and SEO."
  },
  "nofollow-links": {
    keyword: "Nofollow Links",
    definition: "Links with a 'nofollow' attribute that tells search engines not to pass authority to the linked page."
  },
  "dofollow-links": {
    keyword: "DoFollow Links",
    definition: "Standard links that allow search engines to follow them and pass authority to the linked page."
  },
  "sitemap-submission": {
    keyword: "Sitemap Submission",
    definition: "The process of submitting your XML sitemap to search engines to help them crawl and index your website."
  },
  "redirect-chains": {
    keyword: "Redirect Chains",
    definition: "A series of redirects from one URL to another, which can negatively affect site speed and SEO."
  },
  "301-redirect": {
    keyword: "301 Redirect",
    definition: "A permanent redirect from one URL to another, passing most of the original page's SEO value to the new URL."
  },
  "404-errors": {
    keyword: "404 Errors",
    definition: "Errors that occur when a page cannot be found on a server, negatively impacting user experience and SEO."
  },
  "https-redirects": {
    keyword: "HTTPS Redirects",
    definition: "Redirects that ensure visitors access the secure HTTPS version of your site, important for security and SEO."
  },
  "mobile-first-indexing": {
    keyword: "Mobile-First Indexing",
    definition: "Google's practice of primarily using the mobile version of a site for indexing and ranking."
  },
  "google-my-business": {
    keyword: "Google My Business",
    definition: "A free tool from Google that allows businesses to manage their online presence across Google, including Search and Maps."
  },
  "url-slug": {
    keyword: "URL Slug",
    definition: "The part of a URL that comes after the domain name, typically describing the content of the page and including keywords."
  },
  "rich-snippets": {
    keyword: "Rich Snippets",
    definition: "Enhanced search results that display additional information such as ratings, reviews, or prices, often enabled by structured data."
  },
  "video-seo": {
    keyword: "Video SEO",
    definition: "The process of optimizing videos to improve visibility and ranking on search engines, often involving metadata and transcripts."
  },
  "title-tag": {
    keyword: "Title Tag",
    definition: "An HTML element that specifies the title of a web page, displayed on the SERP and in the browser tab, crucial for SEO."
  },
  "keyword-difficulty": {
    keyword: "Keyword Difficulty",
    definition: "A metric that estimates how hard it will be to rank for a specific keyword, based on competition and search volume."
  },
  "keyword-tracking": {
    keyword: "Keyword Tracking",
    definition: "The practice of monitoring the position of keywords in search engine results over time."
  },
  "keyword-mapping": {
    keyword: "Keyword Mapping",
    definition: "The process of assigning target keywords to specific pages on your website to optimize them for search."
  },
  "tf-idf": {
    keyword: "TF-IDF",
    definition: "Term Frequency-Inverse Document Frequency, a statistical measure used to evaluate the importance of a word in a document relative to a corpus."
  },
  "ctr-optimization": {
    keyword: "CTR Optimization",
    definition: "The process of improving click-through rates on search engine results pages by optimizing meta titles, descriptions, and content."
  },
  "organic-keywords": {
    keyword: "Organic Keywords",
    definition: "Keywords that bring traffic to your website through unpaid or natural search results."
  },
  "search-visibility": {
    keyword: "Search Visibility",
    definition: "A metric that estimates the visibility of a website in search engine results, based on the rankings of relevant keywords."
  },
  "seo-plugins": {
    keyword: "SEO Plugins",
    definition: "Tools that extend the functionality of a website, helping to optimize it for search engines, such as Yoast SEO for WordPress."
  },
  "robots-meta-tags": {
    keyword: "Robots Meta Tags",
    definition: "HTML tags that give search engines instructions on how to crawl and index a page's content."
  },
  "https-encryption": {
    keyword: "HTTPS Encryption",
    definition: "The use of SSL/TLS to secure the data transmitted between a user's browser and a website, important for security and SEO."
  },
  "serp-ranking": {
    keyword: "SERP Ranking",
    definition: "The position of a website or web page in the search engine results pages for a given query."
  },
  "rank-tracking": {
    keyword: "Rank Tracking",
    definition: "The practice of monitoring the positions of a website's pages in search engine results over time."
  },
  "google-rank": {
    keyword: "Google Rank",
    definition: "The position of a website or page in Google's search results for a specific query."
  },
  "position-tracking": {
    keyword: "Position Tracking",
    definition: "Monitoring and analyzing the ranking positions of specific keywords over time."
  },
  "rank-fluctuations": {
    keyword: "Rank Fluctuations",
    definition: "Variations in a website's search engine rankings over time, often influenced by algorithm updates or changes in competition."
  },
  "rank-improvements": {
    keyword: "Rank Improvements",
    definition: "Increases in a website's or page's position in search engine results."
  },
  "algorithm-update": {
    keyword: "Algorithm Update",
    definition: "Changes made by search engines to their ranking algorithms, often impacting how websites rank in search results."
  },
  "ranking-signals": {
    keyword: "Ranking Signals",
    definition: "Factors used by search engines to determine the relevance and authority of a website, impacting its position in search results."
  },
  "featured-results": {
    keyword: "Featured Results",
    definition: "Prominently displayed search results, such as featured snippets or rich snippets, often appearing above regular search results."
  },
  "ranking-factors": {
    keyword: "Ranking Factors",
    definition: "Criteria used by search engines to evaluate and rank websites in search results."
  },
  "competitor-analysis": {
    keyword: "Competitor Analysis",
    definition: "The process of evaluating the strengths and weaknesses of competing websites to identify opportunities for improving your own site's SEO."
  },
  "competitor-keywords": {
    keyword: "Competitor Keywords",
    definition: "Keywords that competitors are ranking for, used to inform SEO and content strategies."
  },
  "content-marketing": {
    keyword: "Content Marketing",
    definition: "A strategic marketing approach focused on creating and distributing valuable, relevant, and consistent content to attract and retain a clearly defined audience."
  },
  "inbound-marketing": {
    keyword: "Inbound Marketing",
    definition: "A strategy that focuses on attracting customers through relevant and helpful content, rather than interruptive advertising."
  },
  "outbound-marketing": {
    keyword: "Outbound Marketing",
    definition: "A traditional form of marketing that involves sending messages out to consumers, often through advertising, email blasts, or cold calling."
  },
  "content-strategy": {
    keyword: "Content Strategy",
    definition: "A plan for creating, publishing, and managing content that is aligned with business goals and user needs."
  },
  "content-calendar": {
    keyword: "Content Calendar",
    definition: "A schedule that outlines when and where you plan to publish upcoming content, helping to ensure consistency and organization."
  },
  "content-distribution": {
    keyword: "Content Distribution",
    definition: "The process of sharing and promoting content through various channels, such as social media, email, and syndication."
  },
  "content-promotion": {
    keyword: "Content Promotion",
    definition: "The tactics and strategies used to increase the visibility and reach of your content, often through social media, influencer marketing, and paid advertising."
  },
  "content-amplification": {
    keyword: "Content Amplification",
    definition: "The process of increasing the reach and impact of your content through various methods, including social media sharing, influencer outreach, and paid promotion."
  },
  "social-media-marketing": {
    keyword: "Social Media Marketing",
    definition: "The use of social media platforms to promote products, services, or content, and engage with an audience."
  },
  "influencer-marketing": {
    keyword: "Influencer Marketing",
    definition: "A strategy that involves collaborating with influential people in your industry to promote your products or services."
  },
  "email-marketing": {
    keyword: "Email Marketing",
    definition: "A form of direct marketing that uses email to promote products, services, or content to a targeted audience."
  },
  "affiliate-marketing": {
    keyword: "Affiliate Marketing",
    definition: "A performance-based marketing strategy where businesses reward affiliates for driving traffic or sales through their marketing efforts."
  },
  "pay-per-click": {
    keyword: "Pay-Per-Click (PPC)",
    definition: "An online advertising model where advertisers pay each time a user clicks on one of their ads, commonly used in search engine advertising."
  },
  "cost-per-click": {
    keyword: "Cost-Per-Click (CPC)",
    definition: "The amount an advertiser pays each time a user clicks on their ad, used in pay-per-click advertising models."
  },
  "cost-per-thousand": {
    keyword: "Cost-Per-Thousand (CPM)",
    definition: "A pricing model where advertisers pay per thousand impressions, commonly used in display advertising."
  },
  "conversion-rate": {
    keyword: "Conversion Rate",
    definition: "The percentage of users who take a desired action, such as making a purchase or filling out a form, after clicking on an ad or visiting a website."
  },
  "conversion-funnel": {
    keyword: "Conversion Funnel",
    definition: "A model that describes the stages a user goes through before completing a desired action, such as making a purchase."
  },
  "call-to-action": {
    keyword: "Call to Action (CTA)",
    definition: "A prompt that encourages users to take a specific action, such as 'Buy Now' or 'Sign Up,' often used in marketing materials."
  },
  "landing-page": {
    keyword: "Landing Page",
    definition: "A standalone web page created specifically for a marketing or advertising campaign, designed to encourage a specific action from visitors."
  },
  "lead-generation": {
    keyword: "Lead Generation",
    definition: "The process of attracting and converting strangers and prospects into someone who has indicated interest in your company's product or service."
  },
  "lead-nurturing": {
    keyword: "Lead Nurturing",
    definition: "The process of building relationships with potential customers at every stage of the sales funnel, often through targeted content and marketing campaigns."
  },
  "buyer-persona": {
    keyword: "Buyer Persona",
    definition: "A semi-fictional representation of your ideal customer, based on market research and real data about your existing customers."
  },
  "customer-journey": {
    keyword: "Customer Journey",
    definition: "The complete experience a customer has with a brand, from the initial awareness through to purchase and beyond."
  },
  "customer-lifecycle": {
    keyword: "Customer Lifecycle",
    definition: "The stages a customer goes through when considering, purchasing, using, and maintaining loyalty to a product or service."
  },
  "market-research": {
    keyword: "Market Research",
    definition: "The process of gathering, analyzing, and interpreting information about a market, including information about the target audience and competitors."
  },
  "marketing-strategy": {
    keyword: "Marketing Strategy",
    definition: "A business's overall game plan for reaching prospective consumers and turning them into customers of the products or services the business provides."
  },
  "content-engagement": {
    keyword: "Content Engagement",
    definition: "The level of interaction that users have with your content, such as likes, shares, comments, and time spent on a page."
  },
  "user-generated-content": {
    keyword: "User-Generated Content (UGC)",
    definition: "Content created by your users or customers, often in the form of reviews, testimonials, social media posts, or videos."
  },
  "brand-awareness": {
    keyword: "Brand Awareness",
    definition: "The extent to which consumers are familiar with your brand and recognize it, often a key goal of marketing campaigns."
  },
  "brand-loyalty": {
    keyword: "Brand Loyalty",
    definition: "The tendency of consumers to continuously purchase one brand's products over another, driven by a positive experience or perception of the brand."
  },
  "brand-reputation": {
    keyword: "Brand Reputation",
    definition: "The perception of your brand as held by the public, influenced by factors like product quality, customer service, and marketing."
  },
  "reputation-management": {
    keyword: "Reputation Management",
    definition: "The practice of influencing and controlling the perception of your brand or individual through online and offline strategies."
  },
  "social-proof": {
    keyword: "Social Proof",
    definition: "A psychological phenomenon where people assume the actions of others in an attempt to reflect correct behavior, often used in marketing to build trust."
  },
  "influencer-outreach": {
    keyword: "Influencer Outreach",
    definition: "The process of building relationships with influencers in your industry to promote your brand, products, or services."
  },
  "engagement-rate": {
    keyword: "Engagement Rate",
    definition: "A metric used to measure the amount of interaction content receives, often expressed as a percentage of followers or viewers."
  },
  "social-listening": {
    keyword: "Social Listening",
    definition: "The process of monitoring social media platforms for mentions of your brand, competitors, and industry to gain insights and respond appropriately."
  },
  "social-media-analytics": {
    keyword: "Social Media Analytics",
    definition: "The practice of gathering and analyzing data from social media platforms to inform business decisions and measure the effectiveness of campaigns."
  },
  "social-media-campaign": {
    keyword: "Social Media Campaign",
    definition: "A coordinated marketing effort on social media platforms to achieve a specific goal, such as increasing brand awareness or generating leads."
  },
  "social-media-strategy": {
    keyword: "Social Media Strategy",
    definition: "A plan that outlines your social media goals, the tactics you'll use to achieve them, and the metrics you'll track to measure your success."
  },
  "content-curation": {
    keyword: "Content Curation",
    definition: "The process of finding, organizing, and sharing high-quality content from external sources with your audience."
  },
  "content-creation": {
    keyword: "Content Creation",
    definition: "The process of generating ideas and producing content that resonates with your audience, often including blog posts, videos, infographics, and social media posts."
  },
  "content-aggregation": {
    keyword: "Content Aggregation",
    definition: "The process of collecting content from various sources and presenting it in a consolidated format for your audience."
  },
  "ugc-campaign": {
    keyword: "UGC Campaign",
    definition: "A marketing strategy that encourages your audience to create and share content related to your brand, often incentivized with contests or rewards."
  },
  "social-share-buttons": {
    keyword: "Social Share Buttons",
    definition: "Buttons on a website or blog that allow users to easily share content on their social media profiles."
  },
  "influencer-collaboration": {
    keyword: "Influencer Collaboration",
    definition: "Partnerships between brands and influencers to co-create content, promote products, or reach new audiences."
  },
  "content-repurposing": {
    keyword: "Content Repurposing",
    definition: "The process of reusing existing content in different formats or on different platforms to reach a wider audience."
  },
  "content-updates": {
    keyword: "Content Updates",
    definition: "Revisions made to existing content to keep it current, accurate, and relevant, often improving SEO performance."
  },
  "content-audit": {
    keyword: "Content Audit",
    definition: "A systematic review of all content on a website, assessing its performance and identifying opportunities for improvement."
  },
  "content-gap-analysis": {
    keyword: "Content Gap Analysis",
    definition: "The process of identifying content that is missing or underperforming on your site compared to competitors, and creating new content to fill those gaps."
  },
  "content-optimization": {
    keyword: "Content Optimization",
    definition: "The process of making your content as effective as possible, often through SEO, keyword targeting, and improving user engagement."
  },
  "content-personalization": {
    keyword: "Content Personalization",
    definition: "The practice of tailoring content to individual users based on their preferences, behaviors, and demographics, often using data and automation tools."
  },
  "content-targeting": {
    keyword: "Content Targeting",
    definition: "The practice of delivering content to specific segments of your audience based on criteria like location, interests, or behavior."
  },
  "data-driven-marketing": {
    keyword: "Data-Driven Marketing",
    definition: "A strategy that uses data from various sources to make informed decisions and optimize marketing efforts."
  },
  "conversion-rate-optimization": {
    keyword: "Conversion Rate Optimization (CRO)",
    definition: "The process of increasing the percentage of users who take a desired action on your website, often through A/B testing and user experience improvements."
  },
  "ab-testing": {
    keyword: "A/B Testing",
    definition: "A method of comparing two versions of a web page or element to see which one performs better, often used to optimize conversion rates."
  },
  "multivariate-testing": {
    keyword: "Multivariate Testing",
    definition: "A method of testing multiple variables on a web page simultaneously to determine the best combination for achieving a desired outcome."
  },
  "heatmap-analysis": {
    keyword: "Heatmap Analysis",
    definition: "A visual representation of user activity on a web page, showing where users click, scroll, and spend the most time, used to optimize page design."
  },
  "click-through-rate": {
    keyword: "Click-Through Rate (CTR)",
    definition: "The percentage of users who click on a specific link or ad, used to measure the effectiveness of marketing efforts."
  },
  "bounce-rate": {
    keyword: "Bounce Rate",
    definition: "The percentage of visitors who leave a website after viewing only one page, often used as a measure of site engagement."
  },
  "conversion-tracking": {
    keyword: "Conversion Tracking",
    definition: "The process of monitoring and analyzing the actions users take on your website, such as purchases or sign-ups, to measure the effectiveness of your marketing efforts."
  },
  "cart-abandonment": {
    keyword: "Cart Abandonment",
    definition: "When a potential customer adds items to their shopping cart but leaves the site without completing the purchase, a key metric in e-commerce."
  },
  "retargeting-campaign": {
    keyword: "Retargeting Campaign",
    definition: "A form of online advertising that targets users who have previously visited your site or interacted with your content, encouraging them to return and convert."
  },
  "remarketing-campaign": {
    keyword: "Remarketing Campaign",
    definition: "Similar to retargeting, but typically refers to re-engaging customers through email marketing or other direct communication channels."
  },
  "ad-retargeting": {
    keyword: "Ad Retargeting",
    definition: "A form of online advertising that targets users who have previously visited your website or interacted with your content, encouraging them to return and convert."
  },
  "ad-auction": {
    keyword: "Ad Auction",
    definition: "The process used by platforms like Google Ads to determine which ads will appear in search results and in what order, based on factors like bid amount and ad quality."
  },
  "programmatic-advertising": {
    keyword: "Programmatic Advertising",
    definition: "The automated buying and selling of online ad space, using data and algorithms to target specific audiences."
  },
  "native-advertising": {
    keyword: "Native Advertising",
    definition: "A form of paid media where the ad experience follows the natural form and function of the user experience in which it is placed."
  },
  "display-advertising": {
    keyword: "Display Advertising",
    definition: "A form of online advertising that uses images, videos, and interactive elements to attract users, often shown on websites, apps, or social media platforms."
  },
  "ad-creative": {
    keyword: "Ad Creative",
    definition: "The visual and textual elements of an ad, including the design, images, copy, and call-to-action, used to capture attention and drive conversions."
  },
  "ad-targeting": {
    keyword: "Ad Targeting",
    definition: "The process of directing ads to specific groups of people based on demographics, interests, behavior, and other criteria."
  },
  "lookalike-audiences": {
    keyword: "Lookalike Audiences",
    definition: "Audiences that are similar to your existing customers, often created using data from platforms like Facebook Ads to target potential customers."
  },
  "custom-audiences": {
    keyword: "Custom Audiences",
    definition: "Audiences created based on data from your website, CRM, or other sources, used to target specific groups of people with tailored ads."
  },
  "demographic-targeting": {
    keyword: "Demographic Targeting",
    definition: "The practice of directing ads or content to specific segments of the population based on factors like age, gender, income, education, and more."
  },
  "behavioral-targeting": {
    keyword: "Behavioral Targeting",
    definition: "The practice of delivering ads or content to users based on their past behavior, such as browsing history, purchases, and interactions."
  },
  "geo-targeting": {
    keyword: "Geo-Targeting",
    definition: "The practice of delivering content or ads to users based on their geographic location."
  },
  "interest-targeting": {
    keyword: "Interest Targeting",
    definition: "The practice of delivering content or ads to users based on their interests, often inferred from their online behavior and social media activity."
  },
  "time-of-day-targeting": {
    keyword: "Time-of-Day Targeting",
    definition: "The practice of showing ads or content to users at specific times of the day, often based on when they are most likely to engage."
  },
  "device-targeting": {
    keyword: "Device Targeting",
    definition: "The practice of delivering content or ads to users based on the device they are using, such as mobile, desktop, or tablet."
  },
  "location-based-marketing": {
    keyword: "Location-Based Marketing",
    definition: "A strategy that uses a customer's physical location to deliver personalized content or offers, often through mobile apps or SMS."
  },
  "ai-marketing": {
    keyword: "AI Marketing",
    definition: "The use of artificial intelligence technologies to automate and optimize marketing efforts, such as personalization, content creation, and ad targeting."
  },
  "machine-learning": {
    keyword: "Machine Learning",
    definition: "A type of AI that allows systems to learn and improve from experience without being explicitly programmed, often used in predictive analytics and marketing automation."
  },
  "predictive-analytics": {
    keyword: "Predictive Analytics",
    definition: "The use of data, statistical algorithms, and machine learning techniques to identify the likelihood of future outcomes based on historical data."
  },
  "marketing-automation": {
    keyword: "Marketing Automation",
    definition: "The use of software to automate repetitive marketing tasks, such as email campaigns, social media posts, and ad placements."
  },
  "dynamic-content": {
    keyword: "Dynamic Content",
    definition: "Content that changes based on user behavior, preferences, or demographics, often used to personalize the user experience."
  },
  "personalization-strategy": {
    keyword: "Personalization Strategy",
    definition: "A plan for tailoring content, offers, and experiences to individual users based on their data, behavior, and preferences."
  },
  "customer-segmentation": {
    keyword: "Customer Segmentation",
    definition: "The practice of dividing your audience into smaller groups based on shared characteristics, allowing for more targeted marketing efforts."
  },
  "marketing-segmentation": {
    keyword: "Marketing Segmentation",
    definition: "The process of dividing a market into distinct subsets of consumers with common needs or characteristics, allowing for more targeted marketing."
  },
  "abandoned-cart-email": {
    keyword: "Abandoned Cart Email",
    definition: "An email sent to a customer who has added items to their online shopping cart but left without completing the purchase, encouraging them to return and buy."
  },
  "drip-campaign": {
    keyword: "Drip Campaign",
    definition: "A series of automated emails sent to subscribers over time, often used to nurture leads or onboard new customers."
  },
  "welcome-email": {
    keyword: "Welcome Email",
    definition: "An email sent to new subscribers or customers, typically to introduce them to your brand and encourage engagement."
  },
}

export const keywords = orderBy(Object.entries(keywordsMap).map(([key, value]) => ({
  ...value,
  slug: key
})), ["keyword", "asc"]);

export const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")