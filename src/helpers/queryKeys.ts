const queryKeys = {
  project: (project_id: number) => ["projects", project_id] as const,
  projects: (project_id?: number) => ["projects", { project_id }] as const,
  topicCluster: (topic_cluster_id?: number) => ["topic_clusters", topic_cluster_id] as const,
  topicClusters: (filters: {
    project_id?: number;
    page: number;
    query?: string;
  }) => ["topic_clusters", filters] as const,
  topicClustersCount: (project_id: number) => ["topic_clusters", "topic_clusters_count", project_id] as const,
  article: (article_id: number) => ["articles", article_id] as const,
  articles: (filters: {
    query?: string;
    project_id?: number;
    topic_cluster_id?: number;
    status?: string;
  }) => ["articles", filters] as const,
  articlesCount: (project_id: number) => ["articles", "articles_count", project_id] as const,
  user: () => ["user"] as const,
  users: () => ["users"] as const,
  competitors: (project_id?: number) => ["competitors", { project_id }] as const,
  getAllKeywordsInTopic: (topic_id: number) => ["get_all_topic_keywords", topic_id] as const,

  blogPost: (id: number) => ["blog_posts", id] as const,
  // blogPosts: (filters: {
  //   query?: string;
  //   status?: string;
  //   project_id: number
  // }) => ["blog_posts", filters] as const,
  blogPosts: (project_id?: number, queue?: boolean) => ["blog_posts", { project_id, queue }] as const,
  blogPostsCount: () => ["blog_posts", "blog_posts_count"] as const,
  getAllSeedKeywords: () => ["get_all_seed_keywords"] as const,
  targetAudiences: (filters: {
    query?: string;
    page: number;
    project_id: number
  }) => ["target_audiences", filters] as const,
  writingStyles: (project_id: number) => ["writing_styles", project_id] as const,
  languages: (id?: number) => ["languages", id] as const,
  caption: (id: number) => ["captions", id] as const,
  captions: (project_id: number, queue?: boolean) => ["captions", { project_id, queue }] as const,
  knowledge: (id: number) => ["knowledges", id] as const,
  knowledges: (project_id: number, queue?: boolean) => ["knowledges", { project_id, queue }] as const,

};

export default queryKeys;
