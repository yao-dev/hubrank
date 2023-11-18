import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import queryKeys from "@/helpers/queryKeys";
import supabase from "@/helpers/supabase";
import { getUserId } from "@/helpers/user";
import { isNaN } from "lodash";

const getOne = async (id: number) => {
  return supabase.from('blog_posts').select('*').eq('id', id).single().throwOnError();
}

const useGetOne = (id: number) => {
  return useQuery({
    enabled: typeof id === 'number' && !isNaN(id),
    queryKey: queryKeys.blogPost(id),
    queryFn: () => getOne(id),
    select: ({ data }) => {
      console.log(data)
      return data;
    },
    onError: (error) => {
      console.error('blogPosts.useGetOne', error)
    },
  });
};

type Filters = {
  query?: string;
  status?: string;
  page?: number
}

const getAll = async (filters: Filters) => {
  let query = supabase.from('blog_posts').select('id', { count: 'exact', head: false }).eq("user_id", await getUserId())

  if (filters.status) {
    query = query.eq("status", filters.status)
  }
  if (filters.query) {
    query = query.textSearch(
      'headline',
      filters.query,
      {
        type: "websearch",
        config: "english",
      },
    )
  }

  return query.order("created_at", { ascending: false }).range((filters.page - 1) * 25, (filters.page * 25) - 1).throwOnError();
}

const useGetAll = (filters: Filters) => {
  const tmpFilters = { ...filters, page: filters?.page || 1 }
  return useQuery({
    queryKey: queryKeys.blogPosts(tmpFilters),
    queryFn: () => getAll(tmpFilters),
    onError: (error) => {
      console.error('blogPosts.useGetAll', error)
    },
    keepPreviousData: true,
    refetchOnWindowFocus: true
  });
};

const count = async () => {
  return supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('user_id', await getUserId()).throwOnError()
}

const useCount = () => {
  return useQuery({
    queryKey: queryKeys.blogPostsCount(),
    queryFn: () => count(),
    onError: (error) => {
      console.error('blogPosts.useCount', error)
    },
  });
}

const getAllSeedKeywords = async () => {
  return supabase.from('blog_posts').select('keyword').eq('user_id', await getUserId()).limit(500).throwOnError()
}

const useGetAllSeedKeywords = () => {
  return useQuery({
    queryKey: queryKeys.getAllSeedKeywords(),
    queryFn: () => getAllSeedKeywords(),
    select: ({ data }) => {
      return data?.map((i) => i.keyword);
    },
    onError: (error) => {
      console.error('blogPosts.useGetAllSeedKeywords', error)
    },
  });
};

const deleteOne = async (id: number) => {
  return supabase
    .from('blog_posts')
    .delete()
    .eq('id', id)
    .throwOnError()
}

const useDelete = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteOne,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['blog_posts'],
      });
    },
    onError: (error, variables) => {
      console.log('blogPosts.useDelete', { error, variables })
    },
  })
}

const useBlogPosts = () => {
  return {
    getOne: useGetOne,
    getAll: useGetAll,
    count: useCount,
    getAllSeedKeywords: useGetAllSeedKeywords,
    delete: useDelete()
  }
}

export default useBlogPosts;