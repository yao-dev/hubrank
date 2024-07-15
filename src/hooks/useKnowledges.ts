import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import queryKeys from "@/helpers/queryKeys";
import supabase from "@/helpers/supabase";
import { isNaN } from "lodash";
import useProjectId from "./useProjectId";

const getOne = async (id: number) => {
  return supabase.from('knowledges').select('*').eq('id', id).single();
}

const useGetOne = (id: number) => {
  return useQuery({
    enabled: typeof id === 'number' && !isNaN(id),
    queryKey: queryKeys.knowledge(id),
    queryFn: () => getOne(id),
    select: ({ data }) => {
      return data;
    },
  });
};

const getAll = async (project_id: number, queue?: boolean) => {
  let query = supabase.from('knowledges').select('*').eq("project_id", project_id)

  if (queue) {
    query = query.in("status", ["queue", "ready", "error", "learning"])
  }

  return query.order("created_at", { ascending: false }).throwOnError();
}

const useGetAll = ({ queue }: { queue?: boolean }) => {
  const projectId = useProjectId();

  return useQuery({
    enabled: projectId !== null || projectId !== 0,
    queryKey: queryKeys.knowledges(projectId, queue),
    queryFn: () => getAll(projectId, queue),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
  });
};

const deleteOne = async (id: number) => {
  return supabase
    .from('knowledges')
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
        queryKey: ['knowledges'],
      });
    },
  })
}

const update = async ({ id, ...data }: any) => {
  return supabase
    .from('knowledges')
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
        queryKey: queryKeys.knowledge(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: ["knowledges"],
      });
    },
  })
}


const useKnowledges = () => {
  return {
    getOne: useGetOne,
    getAll: useGetAll,
    delete: useDelete(),
    update: useUpdate()
  }
}

export default useKnowledges;