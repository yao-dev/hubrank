import { keepPreviousData, useQuery } from "@tanstack/react-query";

import queryKeys from "@/helpers/queryKeys";
import supabase from "@/helpers/supabase";
import { getUserId } from "@/helpers/user";

const useUser = () => {
  const { data: user } = useQuery({
    queryKey: queryKeys.user(),
    queryFn: async () => {
      return supabase.from('users').select('*').eq("id", await getUserId()).maybeSingle();
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