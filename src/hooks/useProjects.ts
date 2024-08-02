import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import queryKeys from "@/helpers/queryKeys";
import supabase from "@/helpers/supabase";
import { getUserId } from "@/helpers/user";

const getOne = async (project_id?: number) => {
  if (typeof project_id !== "number") return;
  return supabase.from('projects').select('*, languages!language_id(*)').eq('id', project_id).maybeSingle()
}

const useGetOne = (project_id?: number) => {
  return useQuery({
    // enabled: project_id !== undefined && !isNaN(project_id),
    enabled: !!project_id,
    queryKey: queryKeys.projects(project_id),
    queryFn: () => getOne(project_id),
    select: (res) => {
      return res?.data || null
    },
    gcTime: 0,
    retry: false,
    placeholderData: keepPreviousData,
  });
};

const getAll = async () => {
  // return supabase.from('projects').select('*, topic_clusters(count), articles(count)').order("created_at", { ascending: false }).throwOnError();
  return supabase.from('projects').select('*, languages!language_id(*)').order("created_at", { ascending: true })
}

type UseGetAll = {
  enabled?: boolean
}

const useGetAll = ({ enabled }: UseGetAll = {}) => {
  return useQuery({
    queryKey: queryKeys.projects(),
    queryFn: getAll,
    // enabled: typeof enabled !== 'boolean' ? true : enabled,
    select: ({ data }) => {
      return data;
    },
    // gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: true,
    placeholderData: keepPreviousData,
  });
};

type Create = {
  name: string;
  target_audience?: string;
  website: string;
}

const create = async (data: Create) => {
  return supabase
    .from('projects')
    .insert({
      ...data,
      user_id: await getUserId()
    })
    .select()
    .limit(1)
    .single()
    .throwOnError()
}

const useCreate = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects(),
      });
    },
  })
}

type Update = {
  project_id: number;
  name?: string;
  description?: string;
  sitemap?: string;
}

const update = async ({ project_id, ...data }: Update) => {
  return supabase
    .from('projects')
    .update(data)
    .eq('id', project_id)
    .throwOnError()
}

const useUpdate = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: update,
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects(data.project_id),
      });
    },
  })
}

const deleteOne = async (project_id: number) => {
  return supabase
    .from('projects')
    .delete()
    .eq('id', project_id)
    .throwOnError()
}

const useDelete = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteOne,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects(),
      });
    },
  })
}

const useProjects = () => {
  return {
    getOne: useGetOne,
    getAll: useGetAll,
    create: useCreate(),
    update: useUpdate(),
    delete: useDelete(),
  }
}

export default useProjects;