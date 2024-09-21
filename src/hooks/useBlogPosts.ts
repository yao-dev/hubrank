import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import queryKeys from "@/helpers/queryKeys";
import supabase from '@/helpers/supabase/client';
import { isNaN } from "lodash";
import useProjectId from "./useProjectId";

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
  });
};

const getAll = async (project_id?: number, queue?: boolean) => {
  let query = supabase.from('blog_posts')
    .select('*, languages!language_id(*)')
    .eq("project_id", project_id)

  if (queue) {
    query = query.in("status", ["queue", "ready_to_view", "error", "writing"])
  }

  return query.order("created_at", { ascending: false }).throwOnError();
}

const useGetAll = ({ queue }: { queue?: boolean }) => {
  const projectId = useProjectId();

  return useQuery({
    enabled: projectId !== null || projectId !== 0,
    queryKey: queryKeys.blogPosts(projectId, queue),
    queryFn: () => getAll(projectId, queue),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
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
  })
}


const useBlogPosts = () => {
  return {
    getOne: useGetOne,
    getAll: useGetAll,
    delete: useDelete(),
    update: useUpdate()
  }
}

export default useBlogPosts;