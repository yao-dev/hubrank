import { Client, PublishToUrlResponse } from "@upstash/qstash";
import axios from "axios";

const client = new Client({
  token: process.env.QSTASH_TOKEN || "",
  retry: {
    retries: 1,
    backoff: undefined
  }
});

export const deleteMessage = async (messageId: string) => {
  await client.messages.delete(messageId);
  // await client.dlq.delete(messageId)
}

export const createBackgroundJob = async ({ body, destination, timeoutSec }: any): Promise<PublishToUrlResponse> => {
  const response = await client.publishJSON({
    url: destination,
    body,
    timeout: timeoutSec
  });

  return response
}

export const createSchedule = async ({ body, destination, headers = {} }: any): Promise<string | null> => {
  const { data, status } = await axios.post(`https://qstash.upstash.io/v2/publish/${destination}`, JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
      "Upstash-Retries": 0,
      headers: {
        "Upstash-Retries": 0,
        ...headers,
      }
    },
  });

  if (status >= 400) {
    console.log("schedule response", { status })
    return null;
  }
  if (!data?.messageId) {
    console.log("no message id returned in the response", { data })
    return null;
  }

  return data.messageId
}

export const deleteSchedule = async (messageId: string) => {
  return axios.delete(`https://qstash.upstash.io/v2/messages/${messageId}`, {
    headers: {
      Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
    }
  })
}

export default client