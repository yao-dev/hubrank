import supabase from "@/helpers/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useActiveProject from "./useActiveProject";
import queryKeys from "@/helpers/queryKeys";
import { getUserId } from "@/helpers/user";

type Filters = {
  project_id: number;
  page: number;
  query?: string;
}

const getAll = async (filters: Filters) => {
  let query = supabase.from('target_audience')
    .select("*", { count: 'exact', head: false })
    .order("created_at", { ascending: true })

  if (filters.project_id) {
    query = query.eq('project_id', filters.project_id)
  }
  if (filters.query) {
    query = query.textSearch(
      'audience',
      filters.query,
      {
        type: "websearch",
        config: "english",
      },
    )
  }

  return query.range((filters.page - 1) * 25, (filters.page * 25) - 1).throwOnError();
}

const useGetAll = (filters: Omit<Filters, "project_id">) => {
  const activeProjectId = useActiveProject().id;
  const tmpFilters = { ...filters, page: filters?.page || 1, project_id: activeProjectId }
  return useQuery({
    queryKey: queryKeys.targetAudiences(tmpFilters),
    queryFn: () => getAll(tmpFilters),
  })
}

const createTargetAudience = async (project_id: number, audience: string) => {
  return supabase
    .from('target_audience')
    .insert({ audience, project_id, user_id: await getUserId() })
    .select()
    .single()
    .throwOnError()
}

const useCreate = () => {
  const activeProjectId = useActiveProject().id;
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (audience: string) => createTargetAudience(activeProjectId, audience),
    onSuccess: (_data) => {
      queryClient.invalidateQueries({
        queryKey: ['target_audiences'],
      });
    },
    onError: (error, variables) => {
      console.log('target_audiences.useCreate', { error, variables })
    },
  })
}

const deleteTargetAudience = async (id: number) => {
  return supabase
    .from('target_audience')
    .delete()
    .eq("id", id)
}

const useDelete = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTargetAudience,
    onSuccess: (_data) => {
      queryClient.invalidateQueries({
        queryKey: ['target_audiences'],
      });
    },
    onError: (error, variables) => {
      console.log('target_audiences.useDelete', { error, variables })
    },
  })
}

const useTargetAudiences = () => {
  return {
    getAll: useGetAll,
    create: useCreate(),
    delete: useDelete(),
  }
}

export default useTargetAudiences;