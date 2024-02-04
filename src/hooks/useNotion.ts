import { useEffect, useRef, useState } from "react";
import { Client } from "@notionhq/client";
import { SearchResponse } from "@notionhq/client/build/src/api-endpoints";
import { getUserId } from "@/helpers/user";
import axios from "axios";
import { message } from "antd";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

const notion = new Client({ auth: process.env.NEXT_PUBLIC_NOTION_OAUTH_CLIENT_ID });

export const useNotionIntegrations = () => {
  const [integrations, setIntegrations] = useState<SearchResponse>();

  // useEffect(() => {
  //   (async () => {
  //     const response = await notion.databases.create({

  //     })

  //       .query({
  //         database_id: "f6ba98a3-a5b0-4670-8817-620231361e05",
  //       });
  //     console.log(response);
  //     setIntegrations(response)
  //   })
  // }, []);

  useEffect(() => {
    (async () => {
      await notion.databases.create({
        parent: {
          type: "page_id",
          page_id: "",
        },
        title: [
          {
            type: "text",
            text: {
              content: "Title test",
            },
          },
        ],
        properties: {
          Name: {
            title: {},
          },
        },
      });
    })()
  })

  return integrations;
}

export const useNotionAuth = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const params = useParams()
  const isMounted = useRef(false);
  const queryClient = useQueryClient();
  const [isIntegrationLoading, setIsIntegrationLoading] = useState(false);

  useEffect(() => {
    const platform = params.catchall?.[0];
    if (!isMounted.current && platform === "notion" && code) {
      isMounted.current = true;
      (async () => {
        setIsIntegrationLoading(true)
        axios.post("/api/notion-token", {
          user_id: await getUserId(),
          code,
          platform
        }).then(() => {
          message.success("Notion integration added!");
          queryClient.invalidateQueries({
            queryKey: ["integrations"],
          });
          setIsIntegrationLoading(false)
        }).catch(() => {
          message.error("New integration failed");
          setIsIntegrationLoading(false)
        })
        router.replace('/integrations')
      })()
    }
  }, [params, code]);

  return isIntegrationLoading
}