import { keepPreviousData, useQuery } from "@tanstack/react-query";

import queryKeys from "@/helpers/queryKeys";
import supabase from '@/helpers/supabase/client';

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
    gcTime: 0,
    placeholderData: keepPreviousData,
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
    // gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: true,
    placeholderData: keepPreviousData,
  });
};

const useLanguages = () => {
  return {
    getOne: useGetOne,
    getAll: useGetAll,
  }
}

export default useLanguages;