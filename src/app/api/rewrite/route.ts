import axios from "axios";
import OpenAI from 'openai';
import { shuffle } from 'lodash';

const openai = new OpenAI({
  baseURL: 'https://oai.hconeai.com/v1',
  apiKey: process.env.OPENAI_API_KEY,
  defaultHeaders: {
    "Helicone-Auth": `Bearer ${process.env.HELICONE_AUTH}`,
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  }
});

const gpt = axios.create({
  baseURL: 'https://oai.hconeai.com/v1',
  headers: {
    "Content-Type": "application/json",
    "Helicone-Auth": `Bearer ${process.env.HELICONE_AUTH}`,
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  },
});

const getCompletion = async (prompt: string, opts: object = {}, rawResult?: boolean): Promise<any> => {
  const result = gpt({
    method: "post",
    url: "chat/completions",
    data: {
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 2,
      model: 'gpt-4',
      stream: true,
      n: 1,
      ...opts
    },
  });

  const { data } = await result;
  if (rawResult) {
    return data;
  }
  return data.choices[0]?.message?.content || ""
}

const rewriteConfig = () => ({
  temperature: shuffle([0, 0.1, 0.2, 0.3, 0.4])[0],
  max_tokens: 1500,
  // model: 'gpt-3.5-turbo',
  top_p: shuffle([0.5, 0.55, 0.6, 0.65, 0.7])[0],
})



type AIActionNames = "Complete" |
  "Shorten" |
  "Expand" |
  "Rephrase" |
  "Summarize" |
  "tl;dr" |
  "Simplify" |
  "Spelling & Grammar";

const getActionInstruction = (action: AIActionNames) => {
  switch (action) {
    case "tl;dr":
      return `Write a ${action.toLowerCase()} of the following text:`;
    case "Spelling & Grammar":
      return `Correct the ${action.toLowerCase()} of the following text:`;
    default:
      return `${action} the following text:`;
  }
}

const rewriteContent = ({
  action,
  content: text,
  prevContent,
  nextContent
}: {
  action: AIActionNames;
  content: string;
  prevContent: string;
  nextContent: string;
}) => {
  return `
    ${prevContent ? `text coming before:\n${prevContent.slice(-150)}` : ''}
    ${nextContent ? `text coming after:\n${nextContent.slice(0, 150)}` : ''}
    ${getActionInstruction(action)} ${text?.slice(-500)}
  `
}

// // Extract the `messages` from the body of the request
// const { messages } = await req.json()

// // Request the OpenAI API for the response based on the prompt
// const response = await openai.createChatCompletion({
//   model: 'gpt-3.5-turbo',
//   stream: true,
//   messages: messages,
//   max_tokens: 500,
//   temperature: 0.7,
//   top_p: 1,
//   frequency_penalty: 1,
//   presence_penalty: 1,
// })



export async function POST(request: Request) {
  const body = await request.json();

  const prompt = rewriteContent(body)
  // const response = await getCompletion(prompt, rewriteConfig(), true);
  const response = await openai.chat.completions.create({
    frequency_penalty: 0,
    presence_penalty: 2,
    model: 'gpt-4',
    n: 1,
    ...rewriteConfig(),
    stream: true,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return response
}