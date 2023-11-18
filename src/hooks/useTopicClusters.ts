import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import queryKeys from "@/helpers/queryKeys";
import supabase from "@/helpers/supabase";
import { getUserId } from "@/helpers/user";
import axios from "axios";


const getOne = async (topic_cluster_id?: number) => {
  const { data } = await supabase.from('topic_clusters').select().eq('id', topic_cluster_id).single();
  return data
}

const useGetOne = (topic_cluster_id?: number) => {
  return useQuery({
    enabled: topic_cluster_id !== undefined && !isNaN(topic_cluster_id),
    queryKey: queryKeys.topicCluster(topic_cluster_id),
    queryFn: () => getOne(topic_cluster_id),
    onError: (error) => {
      console.error('topicClusers.useGetOne', error)
    },
  })
}

type Filters = {
  project_id?: number;
  page: number;
  query?: string;
}

const getAll = async (filters: Filters) => {
  let query = supabase
    .from('topic_clusters')
    .select('id, project_id, name, articles!topic_clusters_articles(id, project_id)', { count: 'exact', head: false })
    .order("created_at", { ascending: true })
    .order("created_at", { foreignTable: 'articles', ascending: true })

  if (filters.project_id) {
    query = query.eq('project_id', filters.project_id)
  }
  if (filters.query) {
    query = query.textSearch(
      'name',
      filters.query,
      {
        type: "websearch",
        config: "english",
      },
    )
  }

  return query.range((filters.page - 1) * 25, (filters.page * 25) - 1).throwOnError();
}

const useGetAll = (filters: Filters) => {
  const tmpFilters = { ...filters, page: filters?.page || 1 }
  return useQuery({
    queryKey: queryKeys.topicClusters(tmpFilters),
    queryFn: () => getAll(tmpFilters),
    onError: (error) => {
      console.error('topicClusers.useGetAll', error)
    },
    keepPreviousData: true
  });
};

type Create = {
  project_id: number;
  name: string;
}

const create = async (data: Create) => {
  const { data: keywords } = await axios.post('/api/keywords-research', { keyword: data.name });
  return await supabase
    .from('topic_clusters')
    .insert({
      ...data,
      keywords,
      user_id: await getUserId()
    })
    .select()
    .single()
    .throwOnError();
}

const useCreate = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: create,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        // queryKey: queryKeys.topicClusters(variables.project_id),
        queryKey: ['topic_clusters']
      });
    },
    onError: (error, variables) => {
      console.error('topicClusers.useCreate', { error, variables })
    },
  })
}

const count = (project_id: number) => {
  return supabase.from('topic_clusters').select('*', { count: 'exact', head: true }).eq('project_id', project_id).throwOnError()
}

const useCount = (project_id: number) => {
  return useQuery({
    queryKey: queryKeys.topicClustersCount(project_id),
    queryFn: () => count(project_id),
    onError: (error) => {
      console.error('topicClusers.useCount', error)
    },
  });
}

const deleteOne = async (topic_cluster_id: number) => {
  return supabase.from('topic_clusters').delete().eq('id', topic_cluster_id).throwOnError()
}

const useDelete = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteOne,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['topic_clusters']
      });
      queryClient.invalidateQueries({
        queryKey: ['articles'],
        exact: false
      });
      queryClient.invalidateQueries({
        queryKey: ['article_count'],
        exact: false
      });
    },
    onError: (error, variables) => {
      console.error('topicClusers.useDelete', { error, variables })
    },
  })
}

type Update = {
  topic_cluster_id: number;
  name: string;
}

const update = async (data: Update) => {
  return supabase
    .from('topic_clusters')
    .update({
      name: data.name
    })
    .eq('id', data.topic_cluster_id)
    .throwOnError()
}

const useUpdate = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: update,
    onSuccess: (_data) => {
      queryClient.invalidateQueries({
        // queryKey: queryKeys.topicClusters(variables.project_id),
        queryKey: ['topic_clusters']
      });
    },
    onError: (error, variables) => {
      console.error('topicClusers.useUpdate', { error, variables })
    },
  })
}

const useTopicClusters = () => {
  return {
    getOne: useGetOne,
    getAll: useGetAll,
    count: useCount,
    create: useCreate(),
    update: useUpdate(),
    delete: useDelete(),
  }
}

export default useTopicClusters;