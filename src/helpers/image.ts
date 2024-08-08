import axios from "axios";
import { createClient } from 'pexels';

const getUnsplashImages = async (query: string, count = 5) => {
  const { data } = await axios.get("https://api.unsplash.com/search/photos", {
    params: {
      query: query,
      page: 1,
      per_page: count,
      order_by: "relevant"
    },
    headers: {
      Authorization: `Client-ID ${process.env.NEXT_PUBLIC_UNSPLASH_API_KEY}`
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
  const client = createClient(process.env.NEXT_PUBLIC_PEXELS_API_KEY || "");
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
        Authorization: `Client-ID ${process.env.NEXT_PUBLIC_UNSPLASH_API_KEY}`
      }
    });

    return data?.results.map((i) => {
      return {
        alt: i.alt_description,
        href: i?.urls?.full || i?.urls?.raw || i?.urls?.regular
      }
    })
  } catch (e) {
    console.log(e?.message)
    console.log(e?.response?.data?.errors)
    return [];
  }
}

export const getAiImage = async (query: string) => {
  const details = "detailed, commercial, high resolution, 8k UHD, DSLR, professional photography"
  // const details = "color scheme: pastel orange and faded turquoise"
  const formData = {
    prompt: `${query}`,
    output_format: "webp",
    style_preset: "cinematic",
    aspect_ratio: "1:1",
    negative_prompt: "no script, no text, no brand name, Avoid indoor settings,un-detailed skin.",
    seed: 0,
  };

  const response = await axios.postForm(
    `https://api.stability.ai/v2beta/stable-image/generate/core`,
    axios.toFormData(formData, new FormData()),
    {
      validateStatus: undefined,
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_STABLE_DIFFUSION_API_KEY ?? ""}`,
        Accept: "image/*"
      },
    },
  );

  return response?.data
}