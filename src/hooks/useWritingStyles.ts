import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import queryKeys from "@/helpers/queryKeys";
import supabase from "@/helpers/supabase";
import useProjectId from "./useProjectId";
import { getUserId } from "@/helpers/user";

const getAll = async (project_id: number) => {
  return supabase.from('writing_styles')
    .select('*')
    .eq("project_id", project_id)
    .order("id", { ascending: false }).throwOnError();
}

const useGetAll = () => {
  const projectId = useProjectId();

  return useQuery({
    enabled: projectId !== null || projectId !== 0,
    queryKey: queryKeys.writingStyles(projectId),
    queryFn: () => getAll(projectId),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true
  });
};

type Delete = {
  projectId: number;
  id: number;
  isDefault?: boolean;
}

const deleteOne = async ({ projectId, id, isDefault }: Delete) => {
  return supabase
    .from('writing_styles')
    .delete()
    .eq('id', id)
    .throwOnError()
}

const useDelete = () => {
  const projectId = useProjectId()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteOne,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.writingStyles(projectId),
      });
    },
  })
}

type Update = {
  projectId: number;
  id: number;
}


const update = async ({ projectId, id }: Update) => {
  return Promise.all([
    supabase
      .from('writing_styles')
      .update({ default: true })
      .eq('id', id)
      .eq("project_id", projectId)
      .throwOnError(),
    supabase
      .from('writing_styles')
      .update({ default: false })
      .neq('id', id)
      .throwOnError(),
  ])
}

const useUpdate = () => {
  const projectId = useProjectId();
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: update,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.writingStyles(projectId),
      });
    },
  })
}


const useMarkAsDefault = () => {
  const projectId = useProjectId();
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: update,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.writingStyles(projectId),
      });
    },
  })
}

type Create = {
  project_id: string;
  name: string;
  source_type: string;
  source_value: string;
  default?: boolean;
}

const create = async (data: Create) => {
  console.log(data)
  if (data.default) {
    return Promise.all([
      supabase
        .from('writing_styles')
        .update({ default: false })
        .eq("project_id", data.project_id)
        .throwOnError(),
      supabase
        .from('writing_styles')
        .insert({
          ...data,
          user_id: await getUserId(),
        })
        .throwOnError(),
    ])
  }
  return supabase
    .from('writing_styles')
    .insert({
      ...data,
      user_id: await getUserId(),
    })
    .throwOnError()
}

const useCreate = () => {
  const projectId = useProjectId()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.writingStyles(projectId),
      });
    },
  })
}


const useWritingStyles = () => {
  return {
    getAll: useGetAll,
    delete: useDelete(),
    update: useUpdate(),
    markAsDefault: useMarkAsDefault(),
    create: useCreate()
  }
}

export default useWritingStyles;