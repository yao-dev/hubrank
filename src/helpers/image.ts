import { imageStyles } from "@/options";
import axios from "axios";
import { createClient } from 'pexels';
import ImageKit from "imagekit";
import supabase from "./supabase/server";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGE_KIT_PUBLIC_KEY ?? "",
  privateKey: process.env.IMAGE_KIT_PRIVATE_KEY ?? "",
  urlEndpoint: process.env.IMAGE_KIT_URL_ENDPOINT ?? "",
});


const getUnsplashImages = async (query: string, count = 5) => {
  const { data } = await axios.get("https://api.unsplash.com/search/photos", {
    params: {
      query: query,
      page: 1,
      per_page: count,
      order_by: "relevant"
    },
    headers: {
      Authorization: `Client-ID ${process.env.UNSPLASH_API_KEY}`
    }
  });

  const firstImage = data?.results?.[0];

  if (!firstImage) return;

  return {
    alt: firstImage.alt_description,
    href: firstImage?.urls?.full || firstImage?.urls?.raw || firstImage?.urls?.regular
  }

  // const result = data.results.map((i: any) => ({
  //   description: i.description,
  //   alt_description: i.alt_description,
  //   urls: i.urls.full || i.urls.raw || i.urls.regular,
  //   topic_submissions: i.topic_submissions,
  //   tags: i.tags.map((t: any) => ({
  //     type: t.type,
  //     title: t.title,
  //   }))
  // }));

  // return result;
}

const getPexelsImages = async (query: string) => {
  const client = createClient(process.env.PEXELS_API_KEY || "");
  const result: any = await client.photos.search({ query, per_page: 5 });
  const firstImage = result?.photos?.[0];

  if (!firstImage) return;

  return {
    alt: firstImage.alt,
    href: firstImage?.src?.large2x || firstImage?.src?.large || firstImage?.src?.original || firstImage.url
  }
}

export const getImage = (source: "unsplash" | "pexels", query: string, count?: number) => {
  return source === "unsplash" ? getUnsplashImages(query, count) : getPexelsImages(query)
}

export const getImages = async (query: string, count = 5) => {
  try {
    const { data } = await axios.get("https://api.unsplash.com/search/photos", {
      params: {
        query: query,
        page: 1,
        per_page: count,
        order_by: "relevant"
      },
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_API_KEY}`
      }
    });

    return data?.results.map((i) => {
      return {
        alt: i.alt_description,
        href: i?.urls?.full || i?.urls?.raw || i?.urls?.regular,
        hash: i?.blur_hash,
        thumb: i?.urls?.small
      }
    })
  } catch (e) {
    console.log(e?.message)
    console.log(e?.response?.data?.errors)
    return [];
  }
}

export const getAiImage = async ({ query, image_style, articleId }: { query: string; image_style: string; articleId?: number }) => {
  // const details = "color scheme: pastel orange and faded turquoise"
  const prompt = imageStyles.find((i) => i.name === image_style)
  const type = "png";
  const formData = {
    prompt: prompt?.prompt.replace("{prompt}", query),
    output_format: type,
    // style_preset: "cinematic",
    aspect_ratio: "1:1",
    negative_prompt: prompt?.negative_prompt,
    seed: 0,
  };

  const response = await axios.postForm(
    `https://api.stability.ai/v2beta/stable-image/generate/core`,
    axios.toFormData(formData, new FormData()),
    {
      validateStatus: undefined,
      responseType: "arraybuffer",
      headers: {
        Authorization: `Bearer ${process.env.STABLE_DIFFUSION_API_KEY ?? ""}`,
        Accept: "image/*"
      },
    },
  );

  const base64Image = Buffer.from(response.data).toString('base64');

  const metadata = await imagekit.upload({
    file: base64Image, //required
    fileName: `${Date.now()}.${type}`,   //required
  });

  if (articleId) {
    await supabase().from("blog_posts_images").insert({ blog_post_id: articleId, url: metadata.url, metadata });
  }

  return metadata.url
}