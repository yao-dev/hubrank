import { keepPreviousData, useQuery } from "@tanstack/react-query";

import queryKeys from "@/helpers/queryKeys";
import supabase from "@/helpers/supabase";
import { getUserId } from "@/helpers/user";
import { useEffect, useState } from "react";

const useUser = () => {
  const [userId, setUserId] = useState();

  useEffect(() => {
    getUserId().then((userId) => setUserId(userId)).catch(console.error)
  }, []);

  const { data: user } = useQuery({
    enabled: !!userId,
    queryKey: queryKeys.user(),
    queryFn: async () => {
      return supabase.from('users').select('*').eq("id", userId).maybeSingle();
    },
    select: ({ data }) => {
      return data;
    },
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 10 * 1000,
    placeholderData: keepPreviousData,
  });

  return user;
}

export default useUser;