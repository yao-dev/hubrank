import { getUpstashDestination } from "@/app/api/helpers";
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
  const { data, status } = await axios.post(`https://qstash.upstash.io/v2/schedules/${destination}`, JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
      "Upstash-Retries": 0,
      "Upstash-Callback": getUpstashDestination("api/write/schedule-callback"),
      "Upstash-Failure-Callback": getUpstashDestination("api/write/schedule-callback"),
      ...headers,
    },
  });

  if (status >= 400) {
    console.log("schedule response", { status })
    return null;
  }
  if (!data?.scheduleId) {
    console.log("no message id returned in the response", { data })
    return null;
  }

  return data.scheduleId
}

export const createBatch = async ({ data, destination, headers = {} }: any): Promise<string | null> => {
  return axios.post(`https://qstash.upstash.io/v2/publish/${destination}`, JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
      "Upstash-Retries": 0,
      ...headers,
    },
  });
}


export const deleteSchedule = async (scheduleId: string) => {
  return axios.delete(`https://qstash.upstash.io/v2/messages/${scheduleId}`, {
    headers: {
      Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
    }
  })
}

export const dateToCron = (date: Date) => {
  const minutes = date.getMinutes();
  const hours = date.getHours();
  const days = date.getDate();
  const months = date.getMonth() + 1;
  const dayOfWeek = date.getDay();

  console.log(
    "dateToCron",
    date.toString(),
    date.toUTCString(),
    `${minutes} ${hours} ${days} ${months} ${dayOfWeek}`
  )

  return `${minutes} ${hours} ${days} ${months} ${dayOfWeek}`;
}

export default client