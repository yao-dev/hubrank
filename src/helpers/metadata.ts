import axios from "axios";
// import { chromium } from 'playwright';
import * as cheerio from "cheerio";

export const fetchWebsiteMetadata = async (website: string) => {
  try {
    const { data: html } = await axios.get(website)
    const $ = cheerio.load(html);

    const metaTags: any = {};

    $('meta').each((index, element) => {
      const name = $(element).attr('name');
      const property = $(element).attr('property');
      const content = $(element).attr('content');
      let prop = (name || property) ?? "";
      if (!prop || !content) return
      prop.replaceAll(":", "_").replaceAll("-", "_")
      metaTags[prop] = content;
    });

    $('script[type="application/ld+json"]').each((index, script) => {
      console.log($(script).html())
    });

    // const metaTags = {
    //   title: $('meta[name="title"]').attr('content'),
    //   description: $('meta[name="description"]').attr('content'),
    //   author: $('meta[name="author"]').attr('content'),
    //   robots: $('meta[name="robots"]').attr('content'),
    //   keywords: $('meta[name="keywords"]').attr('content'),
    //   viewport: $('meta[name="viewport"]').attr('content'),
    //   og_type: $('meta[property="og:type"]').attr('content'),
    //   og_url: $('meta[property="og:url"]').attr('content'),
    //   og_locale: $('meta[property="og:locale"]').attr('content'),
    //   og_title: $('meta[property="og:title"]').attr('content'),
    //   og_description: $('meta[property="og:description"]').attr('content'),
    //   og_image: $('meta[property="og:image"]').attr('content'),
    //   twitter_creator: $('meta[property="twitter:creator"]').attr('content'),
    //   twitter_card: $('meta[property="twitter:card"]').attr('content'),
    //   twitter_url: $('meta[property="twitter:url"]').attr('content'),
    //   twitter_title: $('meta[property="twitter:title"]').attr('content'),
    //   twitter_description: $('meta[property="twitter:description"]').attr('content'),
    //   twitter_image: $('meta[property="twitter:image"]').attr('content') || $('meta[property="twitter:image:alt"]').attr('content'),
    //   twitter_site: $('meta[name="twitter:site"]').attr('content'),
    //   twitter_app_name_iphone: $('meta[name="twitter:app:name:iphone"]').attr('content'),
    //   twitter_app_id_iphone: $('meta[name="twitter:app:id:iphone"]').attr('content'),
    //   twitter_app_url_iphone: $('meta[name="twitter:app:url:iphone"]').attr('content'),
    //   twitter_app_name_googleplay: $('meta[name="twitter:app:name:googleplay"]').attr('content'),
    //   twitter_app_id_googleplay: $('meta[name="twitter:app:id:googleplay"]').attr('content'),
    //   twitter_app_url_googleplay: $('meta[name="twitter:app:url:googleplay"]').attr('content')
    // }

    return metaTags
  } catch (e) {
    console.error(e);
    return null;
  }
}