import axios from "axios";

const gpt = axios.create({
  baseURL: process.env.HELICONE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Helicone-Auth": `Bearer ${process.env.HELICONE_AUTH}`,
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  },
});

export const getCompletion = async (prompt: string, opts: object = {}): Promise<string> => {
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
      stream: false,
      n: 1,
      ...opts
    },
  });

  const { data } = await result

  // console.log(data)

  return data.choices[0]?.message?.content || ""
}