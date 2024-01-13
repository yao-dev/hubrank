import { useQuery } from "@tanstack/react-query";

import queryKeys from "@/helpers/queryKeys";
import supabase from "@/helpers/supabase";

const getOne = async (id: number) => {
  return supabase.from('languages').select('*').eq('id', id).limit(1).single()
}

const useGetOne = (id: number) => {
  return useQuery({
    enabled: typeof id === "number",
    queryKey: queryKeys.languages(id),
    queryFn: () => getOne(id),
    select: (res) => {
      return res?.data || null
    },
    cacheTime: 0,
    retry: false,
    onError: console.error,
    keepPreviousData: true
  });
};


const getAll = async () => {
  return supabase.from('languages').select('*').throwOnError()
}

const useGetAll = () => {
  return useQuery({
    queryKey: queryKeys.languages(),
    queryFn: getAll,
    select: ({ data }) => {
      return data;
    },
    onError: console.error,
    // cacheTime: 1000 * 60 * 10,
    refetchOnWindowFocus: true,
    keepPreviousData: true
  });
};

const useLanguages = () => {
  return {
    getOne: useGetOne,
    getAll: useGetAll,
  }
}

export default useLanguages;