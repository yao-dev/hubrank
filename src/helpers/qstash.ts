import { Client } from "@upstash/qstash";
import axios from "axios";

const client = new Client({
  token: process.env.NEXT_PUBLIC_QSTASH_TOKEN || "",
  retry: {
    retries: 0,
    backoff: undefined
  }
});

export const deleteMessage = async (messageId: string) => {
  await client.messages.delete(messageId);
  // await client.dlq.delete(messageId)
}

export const createSchedule = async ({ body, destination, headers = {} }: any): Promise<string> => {
  const { data } = await axios.post(`https://qstash.upstash.io/v2/publish/${destination}`, JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_QSTASH_TOKEN}`,
      "Upstash-Retries": 0,
      ...headers,
    },
  });

  return data.scheduleId
}

export const deleteSchedule = async (scheduleId: string) => {
  return axios.delete(`https://qstash.upstash.io/v2/schedules/${scheduleId}`, {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_QSTASH_TOKEN}`,
    }
  })
}

export default client