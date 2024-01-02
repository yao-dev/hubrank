import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import queryKeys from "@/helpers/queryKeys";
import supabase from "@/helpers/supabase";
import { getUserId } from "@/helpers/user";
import { isNaN } from "lodash";
import useActiveProject from "./useActiveProject";

const getOne = async (id: number) => {
  return supabase.from('blog_posts').select('*').eq('id', id).single();
}

const useGetOne = (id: number) => {
  return useQuery({
    enabled: typeof id === 'number' && !isNaN(id),
    queryKey: queryKeys.blogPost(id),
    queryFn: () => getOne(id),
    select: ({ data }) => {
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
  topic?: number
  project_id: number;
}

const getAll = async (filters: Filters) => {
  let query = supabase.from('blog_posts')
    .select('*', { count: 'exact', head: false })
    .match({
      "user_id": await getUserId(),
      "project_id": filters.project_id
    });

  if (filters.status) {
    query = query.eq("status", filters.status)
  }
  if (filters.topic) {
    const { data: selectedTopic } = await supabase.from('topic_clusters')
      .select('name').eq("id", +filters.topic).limit(1).single();
    query = query.eq("topic", selectedTopic?.name)
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

const useGetAll = (filters: Omit<Filters, "project_id">) => {
  const activeProjectId = useActiveProject().id;
  const tmpFilters = { ...filters, page: filters?.page || 1, project_id: activeProjectId }

  return useQuery({
    enabled: activeProjectId !== null,
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

const update = async ({ id, ...data }: any) => {
  return supabase
    .from('blog_posts')
    .update(data)
    .eq('id', id)
    .throwOnError()
}

const useUpdate = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: update,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.blogPost(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: ["blog_posts"],
      });
    },
    onError: (error, variables) => {
      console.log('blogPosts.useUpdate', { error, variables })
    },
  })
}


const useBlogPosts = () => {
  return {
    getOne: useGetOne,
    getAll: useGetAll,
    count: useCount,
    getAllSeedKeywords: useGetAllSeedKeywords,
    delete: useDelete(),
    update: useUpdate()
  }
}

export default useBlogPosts;