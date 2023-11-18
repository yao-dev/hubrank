import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import queryKeys from "@/helpers/queryKeys";
import supabase from "@/helpers/supabase";
import { getUserId } from "@/helpers/user";
import axios from "axios";
import useProjectId from "./useProjectId";
import { isNaN } from "lodash";
import useActiveTopicId from "./useActiveTopicId";

const getOne = async (article_id: number) => {
  return supabase.from('articles').select('*').eq('id', article_id).single().throwOnError();
}

const useGetOne = (article_id: number) => {
  return useQuery({
    enabled: typeof article_id === 'number' && !isNaN(article_id),
    queryKey: queryKeys.article(article_id),
    queryFn: () => getOne(article_id),
    // refetchOnReconnect: "always",
    // refetchOnMount: false,
    // refetchOnWindowFocus: false,
    select: ({ data }) => {
      return data;
    },
    onError: (error) => {
      console.error('articles.useGetOne', error)
    },
  });
};

type Filters = {
  query?: string;
  project_id: number;
  topic_cluster_id?: number;
  status?: string;
  page?: number
}

const getAll = async (filters: Filters) => {
  let query = supabase.from('articles').select('id, project_id', { count: 'exact', head: false }).eq("project_id", filters.project_id)

  if (filters.topic_cluster_id) {
    query = query.eq("topic_cluster_id", filters.topic_cluster_id)
  }
  if (filters.status) {
    query = query.eq("status", filters.status)
  }
  if (filters.query) {
    query = query.textSearch(
      'title',
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
    queryKey: queryKeys.articles(tmpFilters),
    queryFn: () => getAll(tmpFilters),
    onError: (error) => {
      console.error('articles.useGetAll', error)
    },
    keepPreviousData: true,
    refetchOnWindowFocus: true
  });
};

const create = async (name: string) => {
  return supabase
    .from('articles')
    .insert({
      name,
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
    onSuccess: (_data, variables) => {
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.articles(), // TODO: add project_id
        });
      }, 2000)
    },
    onError: (error, variables) => {
      console.log('articles.useCreate', { error, variables })
    },
  })
}

type Update = {
  article_id: number;
  name: string;
}

const update = async (data: Update) => {
  return supabase
    .from('articles')
    .update({
      name: data.name
    })
    .eq('id', data.article_id)
    .throwOnError()
}

const useUpdate = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: update,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.article(variables.article_id),
      });
    },
    onError: (error, variables) => {
      console.log('articles.useUpdate', { error, variables })
    },
  })
}

const deleteOne = async (article_id: number) => {
  return supabase
    .from('articles')
    .delete()
    .eq('id', article_id)
    .throwOnError()
}

const useDelete = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteOne,
    onSuccess: (_data, articleId) => {
      queryClient.invalidateQueries({
        queryKey: ['topic_clusters'],
      });
      queryClient.invalidateQueries({
        queryKey: ['articles'],
      });
    },
    onError: (error, variables) => {
      console.log('articles.useDelete', { error, variables })
    },
  })
}

const count = (project_id: number) => {
  return supabase.from('articles').select('*', { count: 'exact', head: true }).eq('project_id', project_id).throwOnError()
}

const useCount = (project_id: number) => {
  return useQuery({
    queryKey: queryKeys.articlesCount(project_id),
    queryFn: () => count(project_id),
    onError: (error) => {
      console.error('topicClusers.useCount', error)
    },
  });
}

type GetArticleIdeas = {
  project_id: number;
  topic_cluster_id: number;
  topic_cluster_name: string;
  keywords: string[];
  write_on_save?: boolean;
  articles: {
    keyword: string;
    tone: string[]
    purpose: string;
    content_type: string;
    resource_urls?: string[];
    additional_info?: string;
    clickbait: 'yes' | 'no';
  }[]
}

const getArticleIdeas = async (data: GetArticleIdeas) => {
  const user_id = await getUserId();
  const { data: project } = await supabase.from('projects').select("*").eq("id", data.project_id).single().throwOnError()
  return axios.post('/api/generate-headlines', {
    user_id,
    project_id: data.project_id,
    project_name: project.name,
    project_description: project.description,
    project_target_audience: project.target_audience,
    topic_cluster_id: +data.topic_cluster_id,
    topic_cluster_name: data.topic_cluster_name,
    keywords: data.keywords,
    articles: data.articles,
    write_on_save: data.write_on_save
  });
}

const useGetArticleIdeas = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: getArticleIdeas,
    onSuccess: (_data, variables) => {
      // queryClient.invalidateQueries({
      //   queryKey: queryKeys.topicCluster(variables.topic_cluster_id),
      // });
      queryClient.invalidateQueries({
        queryKey: ['topic_clusters'],
      });
      queryClient.invalidateQueries({
        queryKey: ['articles'],
      });
    },
    onError: (error, variables) => {
      console.log('articles.useGetArticleIdeas', { error, variables })
    },
  })
}

type WriteArticle = {
  project_id: number;
  topic_cluster_name?: string;
  article_id: number;
  headline: string;
  purpose: string;
  content_type: string;
  word_count: number;
  additional_info: string;
  write_on_save?: boolean;
  topic_cluster_id: number;
  tones: string[];
  resource_urls: string;
}

const writeArticle = async (data: WriteArticle) => {
  await supabase.from('articles')
    .update({
      status: data?.write_on_save ? 'queue' : 'waiting_to_be_written',
      title: data.headline,
      word_count: data.word_count,
      purpose: data.purpose,
      content_type: data.content_type,
      tones: data.tones,
      resource_urls: data.resource_urls,
      additional_info: data.additional_info,
    })
    .eq('id', data.article_id)
    .throwOnError()

  // return axios.post('http://127.0.0.1:3001/write-article', {
  //   project_name: project.name,
  //   project_description: project.description,
  //   project_target_audience: project.target_audience,
  //   topic_cluster_name: data.topic_cluster_name,
  //   headline: data.headline,
  //   word_count: data.word_count,
  //   additional_info: data.additional_info,
  //   purpose: data.purpose,
  //   article_id: data.article_id,
  // });
}

const useWrite = () => {
  const queryClient = useQueryClient()
  const activeProjectId = useProjectId()
  return useMutation({
    mutationFn: writeArticle,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.article(variables.article_id),
      });
      queryClient.invalidateQueries({
        queryKey: ['articles'],
        exact: false
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.articlesCount(activeProjectId),
      });
      queryClient.invalidateQueries({
        queryKey: ['topic_clusters'],
        exact: false
      });
    },
    onError: async (error, variables) => {
      console.log('articles.useWrite', { error, variables });
      await supabase.from('articles')
        .update({
          status: '',
        })
        .eq('id', variables.article_id)
    },
  })
}

const getAllKeywordsInTopic = async (topic_id: number) => {
  return supabase.from('articles').select('keyword').eq('topic_cluster_id', topic_id).limit(500).throwOnError()
}

const useGetAllKeywordsInTopic = () => {
  const topicId = useActiveTopicId()
  return useQuery({
    enabled: typeof topicId === 'number' && !isNaN(topicId),
    queryKey: queryKeys.getAllKeywordsInTopic(topicId),
    queryFn: () => getAllKeywordsInTopic(topicId),
    // refetchOnReconnect: "always",
    // refetchOnMount: false,
    // refetchOnWindowFocus: false,
    select: ({ data }) => {
      return data?.map((i) => i.keyword);
    },
    onError: (error) => {
      console.error('articles.useGetAllKeywordsInTopic', error)
    },
  });
};

const useArticles = () => {
  return {
    getOne: useGetOne,
    getAll: useGetAll,
    create: useCreate(),
    update: useUpdate(),
    delete: useDelete(),
    count: useCount,
    getArticleIdeas: useGetArticleIdeas(),
    write: useWrite(),
    getAllKeywordsInTopic: useGetAllKeywordsInTopic
  }
}

export default useArticles;