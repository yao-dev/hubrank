"use client";;
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import queryKeys from "@/helpers/queryKeys";
import supabase from '@/helpers/supabase/client';
import { useContext } from "react";
import { minutesToMilliseconds } from "date-fns";
import { SessionContext } from "@/context/SessionContext";

const useUser = () => {
  const session = useContext(SessionContext);
  const userId = session?.user?.id;

  const { data: user } = useQuery({
    enabled: !!userId,
    queryKey: queryKeys.user(),
    queryFn: async () => {
      return supabase.from('users').select('*, users_premium:users_premium!user_id(*)').eq("id", userId).maybeSingle();
    },
    select: ({ data }) => {
      const user = data ?? {}
      return {
        ...user,
        premium: user?.users_premium?.[0] ?? {}
      }
    },
    gcTime: minutesToMilliseconds(2),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 10 * 1000,
    placeholderData: keepPreviousData,
  });

  return user;
}

export default useUser;