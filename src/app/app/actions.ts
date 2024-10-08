'use server';;
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { google } from 'googleapis';

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY
})

export async function getAIAutocomplete(type: string, value: string) {
  const { text, finishReason, usage } = await generateText({
    model: openai('gpt-4o'),
    prompt: `${type} the text below:\n\n${value}\n\nOutput the same format as the Input`,
  });

  return { text, finishReason, usage };
}


export const searchYouTubeVideos = async (query: string) => {
  try {
    if (!query) {
      return [];
    }

    const response = await youtube.search.list({
      part: ["snippet"],
      maxResults: 25,
      q: query,
    })
    return response.data.items;
  } catch (error) {
    console.error('Error fetching YouTube videos:', error?.response);
    throw error;
  }
}

