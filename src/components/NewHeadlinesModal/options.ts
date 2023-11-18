export const headlineCount = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
  { value: '6', label: '6' },
  { value: '7', label: '7' },
  { value: '8', label: '8' },
  { value: '9', label: '9' },
  { value: '10', label: '10' },
]

export const purposes = [
  {
    "value": "defend",
    "label": "Defend",
    "description": "Argumentative Approach, Advocacy, Supportive Perspective, Justification.",
    enabled: true
  },
  {
    "value": "contest_contradict",
    "label": "Contest / Contradict",
    "description": "Critical Analysis, Counterargument, Rebuttal, Dispute.",
    enabled: true
  },
  {
    "value": "support_idea",
    "label": "Support Idea",
    "description": "Persuasive Writing, Endorsement, Backing, Affirmation.",
    enabled: true
  },
  {
    "value": "explore",
    "label": "Explore",
    "description": "Investigative Approach, Examination, Inquiry, Scrutiny.",
    enabled: true
  },
  {
    "value": "inform_educate",
    "label": "Inform / Educate",
    "description": "Expository Writing, Explanation, Informative Approach, Educational Perspective.",
    enabled: true
  },
  {
    "value": "entertain",
    "label": "Entertain",
    "description": "Narrative Approach, Storytelling, Creative Angle, Engaging Content.",
    enabled: true
  },
  {
    "value": "analyze",
    "label": "Analyze",
    "description": "Analytical Approach, Examination, Breakdown, Assessment.",
    enabled: true
  },
  {
    "value": "challenge",
    "label": "Challenge",
    "description": "Provocative Writing, Questioning Perspective, Inquiry, Debate.",
    enabled: true
  },
  {
    "value": "inspire_motivate",
    "label": "Inspire / Motivate",
    "description": "Inspirational Approach, Encouragement, Uplifting Perspective, Motivational Writing.",
    enabled: true
  },
  {
    "value": "reflect_introspect",
    "label": "Reflect / Introspect",
    "description": "Reflective Approach, Self-Analysis, Personal Insight, Thoughtful Perspective.",
    enabled: true
  },
  {
    "value": "compare_contrast",
    "label": "Compare / Contrast",
    "description": "Comparative Analysis, Distinction, Differentiation, Parallel Examination.",
    enabled: true
  },
  {
    "value": "predict_speculate",
    "label": "Predict / Speculate",
    "description": "Speculative Approach, Forecasting, Projection, Future-Thinking.",
    enabled: true
  },
  {
    "value": "recount_remember",
    "label": "Recount / Remember",
    "description": "Recollection, Memoir, Reminiscence, Narrative Approach.",
    enabled: true
  },
  {
    "value": "advise_recommend",
    "label": "Advise / Recommend",
    "description": "Advisory Perspective, Guidance, Suggestion, Counsel.",
    enabled: true
  },
  {
    "value": "explore_emotions",
    "label": "Explore Emotions",
    "description": "Emotional Angle, Sentimental Approach, Evocative Writing, Empathetic Perspective.",
    enabled: true
  },
  {
    "value": "problem_solve",
    "label": "Problem-Solve",
    "description": "Solution-Oriented Approach, Troubleshooting, Resolution, Remedial Perspective.",
    enabled: true
  },
  {
    "value": "document_chronicle",
    "label": "Document / Chronicle",
    "description": "Documentation, Chronicling, Record-Keeping, Diary-Like Approach.",
    enabled: true
  }
].filter(i => i.enabled);

export const contentTypes = [
  {
    "value": "blog_posts",
    "label": "Blog Posts",
    "description": "Written articles published on a website or blog. They can cover a wide range of topics and can vary in length, style, and depth.",
    enabled: true,
  },
  {
    "value": "listicles",
    "label": "Listicles",
    "description": "Articles presented in a list format, usually with a catchy headline like \"10 Tips for...\" or \"Top 5 Ways to...\". They are easy to read and often provide actionable advice.",
    enabled: true,
  },
  {
    "value": "how_to_guides_tutorials",
    "label": "How-To Guides/Tutorials",
    "description": "Step-by-step instructions on how to accomplish a specific task. These guides provide readers with actionable information and often include visuals.",
    enabled: true,
  },
  {
    "value": "news_articles",
    "label": "News Articles",
    "description": "Timely and informative pieces that cover recent events, developments, or trends in a specific industry or field.",
    enabled: true,
  },
  {
    "value": "opinion_editorial_pieces",
    "label": "Opinion/Editorial Pieces",
    "description": "Personal viewpoints, opinions, or commentaries on various topics, often providing a unique perspective.",
    enabled: true,
  },
  {
    "value": "case_studies",
    "label": "Case Studies",
    "description": "In-depth analyses of specific situations, often showcasing problems, solutions, and the impact of certain actions.",
    enabled: true,
  },
  {
    "value": "interviews",
    "label": "Interviews",
    "description": "Conversations with individuals, experts, or influencers in a particular field, providing insights and diverse perspectives.",
    enabled: true,
  },
  {
    "value": "research_papers_whitepapers",
    "label": "Research Papers/Whitepapers",
    "description": "Detailed, well-researched documents that explore a specific topic, often backed by data, statistics, and references.",
    enabled: true,
  },
  {
    "value": "infographics",
    "label": "Infographics",
    "description": "Visual representations of information, data, or concepts, designed to convey complex ideas in an easily digestible format.",
    enabled: true,
  },
  {
    "value": "videos",
    "label": "Videos",
    "description": "Visual content in video format, which can include tutorials, vlogs, animations, interviews, documentaries, and more.",
    enabled: true,
  },
  {
    "value": "podcasts",
    "label": "Podcasts",
    "description": "Audio content in episodic format, where hosts or guests discuss various topics, often offering insights and expertise.",
    enabled: true,
  },
  {
    "value": "ebooks_guides",
    "label": "Ebooks/Guides",
    "description": "Comprehensive and longer-form content that provides an in-depth exploration of a particular topic. Ebooks are often downloadable and can serve as lead magnets.",
    enabled: true,
  },
  {
    "value": "quizzes_polls",
    "label": "Quizzes and Polls",
    "description": "Interactive content that engages users by testing their knowledge or gathering their opinions on specific subjects.",
    enabled: true,
  },
  {
    "value": "case_stories_testimonials",
    "label": "Case Stories/Testimonials",
    "description": "Real-life accounts of how a product, service, or strategy positively impacted someone's life or business.",
    enabled: true,
  },
  {
    "value": "product_reviews",
    "label": "Product Reviews",
    "description": "Evaluations of products, services, or tools, providing insights into their features, benefits, and drawbacks.",
    enabled: true,
  },
  {
    "value": "personal_stories_memoirs",
    "label": "Personal Stories/Memoirs",
    "description": "Narrative-driven content that shares personal experiences, often used to create connections and evoke emotions.",
    enabled: true,
  },
  {
    "value": "faqs_guides",
    "label": "FAQs and Guides",
    "description": "Frequently asked questions and detailed guides that address common concerns and provide comprehensive answers.",
    enabled: true,
  },
  {
    "value": "roundup_posts",
    "label": "Roundup Posts",
    "description": "Compilation of resources, articles, or tools related to a specific topic, providing readers with a curated list of valuable information.",
    enabled: true,
  },
  {
    "value": "comparative_analysis",
    "label": "Comparative Analysis",
    "description": "Detailed comparisons of two or more products, services, concepts, or ideas, helping readers make informed decisions.",
    enabled: true,
  },
  {
    "value": "guest_posts",
    "label": "Guest Posts",
    "description": "Content contributed by guest writers who are experts or influencers in a particular field, offering fresh perspectives and insights.",
    enabled: true,
  }
].filter(i => i.enabled);