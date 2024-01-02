import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import queryKeys from "@/helpers/queryKeys";
import supabase from "@/helpers/supabase";
import { getUserId } from "@/helpers/user";
import { fetchWebsiteMetadata } from "@/helpers/metadata";

const getOne = async (project_id: number) => {
  // if (!project_id) return;
  return supabase.from('projects').select('*').eq('id', project_id).single()
}

const useGetOne = (project_id: number) => {
  return useQuery({
    // enabled: project_id !== undefined && !isNaN(project_id),
    // enabled: project_id > 0,
    queryKey: queryKeys.projects(project_id),
    queryFn: () => getOne(project_id),
    select: (res) => {
      return res?.data || null
    },
    cacheTime: 0,
    retry: false,
    onError: (error) => {
      console.error('projects.useGetOne', error)
    },
    keepPreviousData: true
  });
};

const getAll = async () => {
  // return supabase.from('projects').select('*, topic_clusters(count), articles(count)').order("created_at", { ascending: false }).throwOnError();
  return supabase.from('projects').select('*').order("created_at", { ascending: true })
}

type UseGetAll = {
  enabled?: boolean
}

const useGetAll = ({ enabled }: UseGetAll = {}) => {
  return useQuery({
    queryKey: queryKeys.projects(),
    queryFn: getAll,
    enabled: typeof enabled !== 'boolean' ? true : enabled,
    select: ({ data }) => {
      return data;
    },
    onError: (error) => {
      console.error('projects.useGetAll', error)
    },
    cacheTime: 1000 * 60 * 10,
    // refetchOnWindowFocus: true
  });
};

type Create = {
  name: string;
  // description: string;
  // target_audience: string;
  website: string;
}

const create = async (data: Create) => {
  return supabase
    .from('projects')
    .insert({
      ...data,
      metadata: await fetchWebsiteMetadata(data.website),
      user_id: await getUserId()
    })
    .select()
    .single()
    .throwOnError()
}

const useCreate = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: create,
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects(),
        });
      }, 2000)
    },
    onError: (error, variables) => {
      console.log('projects.useCreate', { error, variables })
    },
  })
}

type Update = {
  project_id: number;
  name?: string;
  // description: string;
  target_audience?: string;
  training?: string;
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
    onError: (error, variables) => {
      console.log('projects.useUpdate', { error, variables })
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
    onError: (error, variables) => {
      console.error('projects.useDelete', { error, variables })
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