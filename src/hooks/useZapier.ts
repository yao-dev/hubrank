import { useEffect, useRef, useState } from "react";
import { getUserId } from "@/helpers/user";
import axios from "axios";
import { message } from "antd";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

export const useZapier = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const client_id = searchParams.get('client_id');
  const params = useParams()
  const isMounted = useRef(false);
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const platform = params.catchall?.[0];
    if (!isMounted.current && platform === "zapier" && client_id) {
      isMounted.current = true;
      (async () => {
        setIsLoading(true)
        axios.post("/api/zapier-integration", {
          user_id: await getUserId(),
          client_id,
          platform
        }).then(() => {
          message.success("Zapier integration added!");
          queryClient.invalidateQueries({
            queryKey: ["integrations"],
          });
          setIsLoading(false)
        }).catch(() => {
          message.error("New integration failed");
          setIsLoading(false)
        })
        router.replace('/integrations')
      })()
    }
  }, [params, client_id]);

  const login = () => {
    router.push(process.env.NEXT_PUBLIC_ZAPIER_OAUTH_REDIRECT_URI || "")
  }

  return {
    isLoading,
    login
  }
}