import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import queryKeys from "@/helpers/queryKeys";
import supabase from "@/helpers/supabase";
import useActiveProject from "./useActiveProject";
import { getUserId } from "@/helpers/user";

const getAll = async (project_id: number) => {
  return supabase.from('competitors').select('*').eq('project_id', project_id).order('created_at', { ascending: true }).throwOnError();
}

const useGetAll = (project_id: number) => {
  return useQuery({
    queryKey: queryKeys.competitors(project_id),
    queryFn: () => getAll(project_id),
    select: ({ data }) => {
      return data;
    },
    onError: (error) => {
      console.error('competitors.useGetAll', error)
    },
    cacheTime: 1000 * 60 * 10
  });
};

type Update = {
  competitorId: number;
  training?: string;
}

const update = async ({ competitorId, ...data }: Update) => {
  return supabase
    .from('competitors')
    .update(data)
    .eq('id', competitorId)
    .throwOnError()
}

const useUpdate = (projectId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: update,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.competitors(projectId),
      });
    },
    onError: (error, variables) => {
      console.log('competitors.useUpdate', { error, variables })
    },
  })
}

const addCompetitors = async ({ competitors, projectId }: { competitors: string[]; projectId?: number }) => {
  if (!projectId) {
    throw new Error('no project id')
  }

  const user_id = await getUserId();
  const { data: competitorsFound } = await supabase.from('competitors').select().eq('project_id', projectId)
  const competitorsToDelete = competitorsFound?.filter((cf) => !competitors.find(url => cf.url === url));
  const competitorsToAdd = competitors?.filter((url) => !competitorsFound?.find(cf => url === cf.url));

  const promises: any = [];

  if (competitorsToDelete?.length) {
    promises.push(
      supabase
        .from('competitors')
        .delete()
        .in('id', competitorsToDelete.map((c) => c.id))
        .throwOnError()
    )
  }

  if (competitorsToAdd?.length) {
    promises.push(
      supabase
        .from('competitors')
        .insert(competitorsToAdd.map((url) => ({
          url,
          project_id: +projectId,
          user_id
        })))
        .throwOnError()
    )
  }

  return Promise.all(promises)
}

const useAddCompetitors = (projectId?: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (competitors: string[]) => addCompetitors({ competitors, projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.competitors(projectId),
      });
    },
    onError: (error, variables) => {
      console.error('competitors.useAddCompetitors', { error, variables })
    },
  })
}

const useCompetitors = () => {
  const projectId = useActiveProject().id
  return {
    getAll: () => useGetAll(projectId),
    updateCompetitors: useUpdate(projectId),
    addCompetitors: useAddCompetitors(projectId),
  }
}

export default useCompetitors;