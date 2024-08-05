import { IconBrandFacebook, IconBrandInstagram, IconBrandLinkedin, IconBrandPinterest, IconBrandThreads, IconBrandTiktok, IconBrandX } from "@tabler/icons-react";
import { Flex } from "antd";

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

// export const purposes = [
//   {
//     "value": "defend",
//     "label": "Defend",
//     "description": "Argumentative Approach, Advocacy, Supportive Perspective, Justification.",
//     enabled: true
//   },
//   {
//     "value": "contest_contradict",
//     "label": "Contest / Contradict",
//     "description": "Critical Analysis, Counterargument, Rebuttal, Dispute.",
//     enabled: true
//   },
//   {
//     "value": "support_idea",
//     "label": "Support Idea",
//     "description": "Persuasive Writing, Endorsement, Backing, Affirmation.",
//     enabled: true
//   },
//   {
//     "value": "explore",
//     "label": "Explore",
//     "description": "Investigative Approach, Examination, Inquiry, Scrutiny.",
//     enabled: true
//   },
//   {
//     "value": "inform_educate",
//     "label": "Inform / Educate",
//     "description": "Expository Writing, Explanation, Informative Approach, Educational Perspective.",
//     enabled: true
//   },
//   {
//     "value": "entertain",
//     "label": "Entertain",
//     "description": "Narrative Approach, Storytelling, Creative Angle, Engaging Content.",
//     enabled: true
//   },
//   {
//     "value": "analyze",
//     "label": "Analyze",
//     "description": "Analytical Approach, Examination, Breakdown, Assessment.",
//     enabled: true
//   },
//   {
//     "value": "challenge",
//     "label": "Challenge",
//     "description": "Provocative Writing, Questioning Perspective, Inquiry, Debate.",
//     enabled: true
//   },
//   {
//     "value": "inspire_motivate",
//     "label": "Inspire / Motivate",
//     "description": "Inspirational Approach, Encouragement, Uplifting Perspective, Motivational Writing.",
//     enabled: true
//   },
//   {
//     "value": "reflect_introspect",
//     "label": "Reflect / Introspect",
//     "description": "Reflective Approach, Self-Analysis, Personal Insight, Thoughtful Perspective.",
//     enabled: true
//   },
//   {
//     "value": "compare_contrast",
//     "label": "Compare / Contrast",
//     "description": "Comparative Analysis, Distinction, Differentiation, Parallel Examination.",
//     enabled: true
//   },
//   {
//     "value": "predict_speculate",
//     "label": "Predict / Speculate",
//     "description": "Speculative Approach, Forecasting, Projection, Future-Thinking.",
//     enabled: true
//   },
//   {
//     "value": "recount_remember",
//     "label": "Recount / Remember",
//     "description": "Recollection, Memoir, Reminiscence, Narrative Approach.",
//     enabled: true
//   },
//   {
//     "value": "advise_recommend",
//     "label": "Advise / Recommend",
//     "description": "Advisory Perspective, Guidance, Suggestion, Counsel.",
//     enabled: true
//   },
//   {
//     "value": "explore_emotions",
//     "label": "Explore Emotions",
//     "description": "Emotional Angle, Sentimental Approach, Evocative Writing, Empathetic Perspective.",
//     enabled: true
//   },
//   {
//     "value": "problem_solve",
//     "label": "Problem-Solve",
//     "description": "Solution-Oriented Approach, Troubleshooting, Resolution, Remedial Perspective.",
//     enabled: true
//   },
//   {
//     "value": "document_chronicle",
//     "label": "Document / Chronicle",
//     "description": "Documentation, Chronicling, Record-Keeping, Diary-Like Approach.",
//     enabled: true
//   }
// ].filter(i => i.enabled);

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
    enabled: false,
  },
  {
    "value": "research_papers_whitepapers",
    "label": "Research Papers/Whitepapers",
    "description": "Detailed, well-researched documents that explore a specific topic, often backed by data, statistics, and references.",
    enabled: false,
  },
  {
    "value": "infographics",
    "label": "Infographics",
    "description": "Visual representations of information, data, or concepts, designed to convey complex ideas in an easily digestible format.",
    enabled: false,
  },
  {
    "value": "videos",
    "label": "Videos",
    "description": "Visual content in video format, which can include tutorials, vlogs, animations, interviews, documentaries, and more.",
    enabled: false,
  },
  {
    "value": "podcasts",
    "label": "Podcasts",
    "description": "Audio content in episodic format, where hosts or guests discuss various topics, often offering insights and expertise.",
    enabled: false,
  },
  {
    "value": "ebooks_guides",
    "label": "Ebooks/Guides",
    "description": "Comprehensive and longer-form content that provides an in-depth exploration of a particular topic. Ebooks are often downloadable and can serve as lead magnets.",
    enabled: false,
  },
  {
    "value": "quizzes_polls",
    "label": "Quizzes and Polls",
    "description": "Interactive content that engages users by testing their knowledge or gathering their opinions on specific subjects.",
    enabled: false,
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
    "value": "product_comparison",
    "label": "Product Comparison",
    "description": "Detailed comparisons of two or more products, services, concepts, or ideas, helping readers make informed decisions.",
    enabled: true,
  },
  {
    "value": "personal_stories_memoirs",
    "label": "Personal Stories/Memoirs",
    "description": "Narrative-driven content that shares personal experiences, often used to create connections and evoke emotions.",
    enabled: false,
  },
  {
    "value": "faqs_guides",
    "label": "FAQs and Guides",
    "description": "Frequently asked questions and detailed guides that address common concerns and provide comprehensive answers.",
    enabled: false,
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
    enabled: false,
  },
  {
    "value": "guest_posts",
    "label": "Guest Posts",
    "description": "Content contributed by guest writers who are experts or influencers in a particular field, offering fresh perspectives and insights.",
    enabled: false,
  },
  {
    value: "question_answers",
    label: "Question / Answer",
    enabled: true
  },
  {
    value: "glossary",
    label: "Glossary",
    enabled: true
  }
].filter(i => i.enabled);

export const tones = [
  { value: "storytelling", label: "Storytelling" },
  { value: "conversational", label: "Conversational" },
  { value: "humorous", label: "Humorous" },
  { value: "encouraging", label: "Encouraging" },
  { value: "empowering", label: "Empowering" },
  { value: "educational", label: "Educational/Informative" },
  { value: "inspirational", label: "Inspirational" },
  { value: "professional", label: "Professional" },
  { value: "cautious", label: "Cautious" },
  { value: "realistic", label: "Realistic" },
  { value: "practical", label: "Practical" },
  { value: "reflective", label: "Reflective" },
  { value: "thoughtful", label: "Thoughtful" },
  { value: "thought-provoking", label: "Thought-provoking" },
  { value: "sympathetic", label: "Sympathetic" },
  { value: "supportive", label: "Supportive" },
  { value: "motivational", label: "Motivational" },
  { value: "optimistic", label: "Optimistic" },
  { value: "nurturing", label: "Nurturing" },
  { value: "inquisitive", label: "Inquisitive" },
  { value: "playful", label: "Playful" },
  { value: "analytical", label: "Analytical" },
  { value: "respectful", label: "Respectful" },
  { value: "enthusiastic", label: "Enthusiastic" },
  { value: "compassionate", label: "Compassionate" },
  { value: "inclusive", label: "Inclusive" },
  { value: "assertive", label: "Assertive" },
  { value: "curious", label: "Curious" },
  { value: "objective", label: "Objective" },
  { value: "reassuring", label: "Reassuring" },
  { value: "candid", label: "Candid" }
];

export const languages = [
  {
    "name": "american",
    "label": "English (us)",
    "value": "en",
    "image": "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/US.svg"
  },
  {
    "name": "english",
    "label": "English (uk)",
    "value": "gb", // gb
    "image": "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/GB.svg",
  },
  {
    "name": "spanish",
    "label": "Spanish",
    "value": "es",
    "image": "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/ES.svg"
  },
  {
    "name": "portuguese",
    "label": "Portuguese",
    "value": "pt",
    "image": "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/PT.svg"
  },
  {
    "name": "french",
    "label": "French",
    "value": "fr",
    "image": "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/FR.svg"
  },
  {
    "name": "italian",
    "label": "Italian",
    "value": "it",
    "image": "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/IT.svg"
  },
];


export const medias = [
  {
    "value": "none",
    "label": "None",
  },
  {
    "value": "auto",
    "label": "Auto",
  },
  {
    "value": "image",
    "label": "Image",
  },
  {
    "value": "gif",
    "label": "Gif",
  },
  {
    "value": "youtube_video",
    "label": "Youtube video",
  },
];

export const wordsCounts = [
  {
    "value": "auto",
    "label": "Auto",
  },
  {
    "value": "very_short",
    "label": "Very short (30-50 words)",
  },
  {
    "value": "short",
    "label": "Short (50-200 words)",
  },
  {
    "value": "medium",
    "label": "Medium (200-400 words)",
  },
  {
    "value": "long",
    "label": "Long (400-600 words)",
  },
]

export const callToActions = [
  {
    "value": "sign_up",
    "label": "Sign up",
  },
  {
    "value": "get_started",
    "label": "Get started",
  },
  {
    "value": "join_now",
    "label": "Join now",
  },
  {
    "value": "learn_more",
    "label": "Learn more",
  },
  {
    "value": "request_demo",
    "label": "Request a demo",
  },
  {
    "value": "download",
    "label": "Download now",
  },
  {
    "value": "install",
    "label": "Install now",
  },
  {
    "value": "subscribe",
    "label": "Subscribe",
  },
  {
    "value": "contact_us",
    "label": "Contact us",
  },
]

export const headingsCount = [
  {
    "value": "3",
    "label": "3",
  },
  {
    "value": "4",
    "label": "4",
  },
  {
    "value": "5",
    "label": "5",
  },
  {
    "value": "6",
    "label": "6",
  },
  {
    "value": "7",
    "label": "7",
  },
  {
    "value": "8",
    "label": "8",
  },
  {
    "value": "9",
    "label": "9",
  },
  {
    "value": "10",
    "label": "10",
  },
]

export const creativities = [
  { value: 0, label: 'low' },
  { value: 0.4, label: 'normal' },
  { value: 0.5, label: 'high' },
]

export const SCHEMA_MARKUPS = {
  // BreadcrumbList: {
  //   "@context": "https://schema.org",
  //   "@type": "BreadcrumbList",
  //   "itemListElement":
  //     [
  //       {
  //         "@type": "ListItem",
  //         "position": 1,
  //         "item":
  //         {
  //           "@id": "https://example.com/dresses",
  //           "name": "Dresses"
  //         }
  //       },
  //       {
  //         "@type": "ListItem",
  //         "position": 2,
  //         "item":
  //         {
  //           "@id": "https://example.com/dresses/real",
  //           "name": "Real Dresses"
  //         }
  //       }
  //     ]
  // },
  VideoObject: {},
  Recipe: {},
  Article: {},
  WebSite: {},
  WebPage: {},
  BlogPosting: {},
  FAQPage: {},
  Question: {},
}

export const emotions = [
  {
    label: "Joy",
    value: "Joy",
  },
  {
    label: "Sadness",
    value: "Sadness",
  },
  {
    label: "Anger",
    value: "Anger",
  },
  {
    label: "Fear",
    value: "Fear",
  },
  {
    label: "Surprise",
    value: "Surprise",
  },
  {
    label: "Disgust",
    value: "Disgust",
  },
  {
    label: "Anticipation",
    value: "Anticipation",
  },
  {
    label: "Trust",
    value: "Trust",
  },
  {
    label: "Love",
    value: "Love",
  },
  {
    label: "Frustration",
    value: "Frustration",
  },
  {
    label: "Empathy",
    value: "Empathy",
  },
  {
    label: "Optimism",
    value: "Optimism",
  },
  {
    label: "Nostalgia",
    value: "Nostalgia",
  },
  {
    label: "Excitement",
    value: "Excitement",
  },
  {
    label: "Anxiety",
    value: "Anxiety"
  },
  {
    label: "Joke",
    value: "Joke"
  },
  {
    label: "Pun",
    value: "Pun"
  },
  {
    label: "Sarcasm",
    value: "Sarcasm"
  },
  {
    label: "Funny",
    value: "Funny"
  },
]

export const purposes = [
  {
    label: "Informative",
    value: "Informative",
  },
  {
    label: "Persuasive",
    value: "Persuasive",
  },
  {
    label: "Entertaining",
    value: "Entertaining",
  },
  {
    label: "Descriptive",
    value: "Descriptive",
  },
  {
    label: "Narrative",
    value: "Narrative",
  },
  {
    label: "Explanatory",
    value: "Explanatory",
  },
  {
    label: "Reflective",
    value: "Reflective",
  },
  {
    label: "Instructive",
    value: "Instructive",
  },
  {
    label: "Expressive",
    value: "Expressive",
  },
  {
    label: "Analytical",
    value: "Analytical",
  },
  {
    label: "Critical",
    value: "Critical",
  },
  {
    label: "Motivational",
    value: "Motivational",
  },
  {
    label: "Evaluative",
    value: "Evaluative",
  },
  {
    label: "Speculative",
    value: "Speculative",
  },
  {
    label: "Satirical",
    value: "Satirical",
  },
  {
    label: "Defend",
    value: "Defend",
  },
  {
    label: "Contest / Contradict",
    value: "Contest / Contradict",
  },
  {
    label: "Support Idea",
    value: "Support Idea",
  },
  {
    label: "Explore",
    value: "Explore",
  },
  {
    label: "Analyze",
    value: "Analyze",
  },
  {
    label: "Challenge",
    value: "Challenge",
  },
  {
    label: "Inspire / Motivate",
    value: "Inspire / Motivate",
  },
  {
    label: "Compare / Contrast",
    value: "Compare / Contrast",
  },
  {
    label: "Advise / Recommend",
    value: "Advise / Recommend",
  },
  {
    label: "Problem-Solve",
    value: "Problem-Solve",
  },
  {
    label: "Document / Chronicle",
    value: "Document / Chronicle",
  },
]

export const vocabularies = [
  {
    label: "Technical",
    value: "Technical",
  },
  {
    label: "Colloquial",
    value: "Colloquial",
  },
  {
    label: "Formal",
    value: "Formal",
  },
  {
    label: "Informal",
    value: "Informal",
  },
  {
    label: "Jargon",
    value: "Jargon",
  },
  {
    label: "Slang",
    value: "Slang",
  },
  {
    label: "Idiomatic",
    value: "Idiomatic",
  },
  {
    label: "Descriptive",
    value: "Descriptive",
  },
  {
    label: "Abstract",
    value: "Abstract",
  },
  {
    label: "Concrete",
    value: "Concrete",
  },
  {
    label: "Emotional",
    value: "Emotional",
  },
  {
    label: "Neutral",
    value: "Neutral",
  },
  {
    label: "Positive",
    value: "Positive",
  },
  {
    label: "Negative",
    value: "Negative",
  },
  {
    label: "Figurative",
    value: "Figurative"
  },
]

export const sentenceStructures = [
  {
    label: "Simple sentences",
    value: "Simple sentences",
  },
  {
    label: "Compound sentences",
    value: "Compound sentences",
  },
  {
    label: "Complex sentences",
    value: "Complex sentences",
  },
  {
    label: "Compound-complex sentences",
    value: "Compound-complex sentences",
  },
  {
    label: "Declarative sentences",
    value: "Declarative sentences",
  },
  {
    label: "Interrogative sentences",
    value: "Interrogative sentences",
  },
  {
    label: "Exclamatory sentences",
    value: "Exclamatory sentences",
  },
  {
    label: "Imperative sentences",
    value: "Imperative sentences",
  },
  {
    label: "Parallel structure",
    value: "Parallel structure",
  },
  {
    label: "Parenthetical elements",
    value: "Parenthetical elements",
  },
  {
    label: "Lists and series",
    value: "Lists and series",
  },
  {
    label: "Rhetorical questions",
    value: "Rhetorical questions",
  },
  {
    label: "Short sentences for emphasis",
    value: "Short sentences for emphasis",
  },
  {
    label: "Long, descriptive sentences",
    value: "Long, descriptive sentences",
  },
  {
    label: "Inverted sentences (starting with a phrase or clause)",
    value: "Inverted sentences (starting with a phrase or clause)"
  },
]

export const perspectives = [
  {
    label: "First-person singular (I)",
    value: "First-person singular (I)",
  },
  {
    label: "First-person plural (we)",
    value: "First-person plural (we)",
  },
  {
    label: "Second-person singular (you)",
    value: "Second-person singular (you)",
  },
  {
    label: "Second-person plural (you all)",
    value: "Second-person plural (you all)",
  },
  {
    label: "Third-person singular (he/she/it)",
    value: "Third-person singular (he/she/it)",
  },
  {
    label: "Third-person plural (they)",
    value: "Third-person plural (they)",
  },
  {
    label: "Objective perspective",
    value: "Objective perspective",
  },
  {
    label: "Subjective perspective",
    value: "Subjective perspective",
  },
  {
    label: "Omniscient narrator",
    value: "Omniscient narrator",
  },
  {
    label: "Limited omniscient narrator",
    value: "Limited omniscient narrator",
  },
  {
    label: "Stream of consciousness",
    value: "Stream of consciousness",
  },
  {
    label: "Reflective perspective",
    value: "Reflective perspective",
  },
  {
    label: "Retrospective perspective",
    value: "Retrospective perspective",
  },
  {
    label: "Unreliable narrator",
    value: "Unreliable narrator",
  },
  {
    label: "Multiple perspectives",
    value: "Multiple perspectives",
  },
  {
    label: "Peripheral narrator",
    value: "Peripheral narrator",
  },
  {
    label: "Epistolary (letters, diary entries)",
    value: "Epistolary (letters, diary entries)",
  },
  {
    label: "Dramatic/Third-person objective",
    value: "Dramatic/Third-person objective",
  },
  {
    label: "Direct address to the reader",
    value: "Direct address to the reader",
  },
  {
    label: "Alternating perspectives",
    value: "Alternating perspectives"
  },
]

export const writingStructures = [
  {
    label: "Problem-solution",
    value: "Problem-solution",
  },
  {
    label: "Cause-effect",
    value: "Cause-effect",
  },
  {
    label: "Compare-contrast",
    value: "Compare-contrast",
  },
  {
    label: "Chronological order",
    value: "Chronological order",
  },
  {
    label: "Spatial order",
    value: "Spatial order"
  },
]

export const instructionalElements = [
  {
    label: "Actionable advice",
    value: "Actionable advice",
  },
  {
    label: "Step-by-step instructions",
    value: "Step-by-step instructions",
  },
  {
    label: "Tips and tricks",
    value: "Tips and tricks",
  },
  {
    label: "How-to guides",
    value: "How-to guides",
  },
  {
    label: "Checklists",
    value: "Checklists"
  },
]

export const structuredSchemas = [
  {
    label: "BreadcrumbList",
    value: "BreadcrumbList",
  },
  {
    label: "VideoObject",
    value: "VideoObject",
  },
  {
    label: "Recipe",
    value: "Recipe",
  },
  {
    label: "Article",
    value: "Article",
  },
  {
    label: "WebSite",
    value: "WebSite",
  },
  {
    label: "WebPage",
    value: "WebPage",
  },
  {
    label: "BlogPosting",
    value: "BlogPosting",
  },
  {
    label: "FAQPage",
    value: "FAQPage",
  },
  {
    label: "Question",
    value: "Question",
  },
];

export const platforms = {
  instagram: {
    icon: <IconBrandInstagram />,
    label: (
      <Flex gap="small" align="center">
        <IconBrandInstagram />
        <span>Instagram</span>
      </Flex>
    ),
    value: "instagram"
  },
  x: {
    icon: <IconBrandX />,
    label: (
      <Flex gap="small" align="center">
        <IconBrandX />
        <span>X</span>
      </Flex>
    ),
    value: "x"
  },
  linkedin: {
    icon: <IconBrandLinkedin />,
    label: (
      <Flex gap="small" align="center">
        <IconBrandLinkedin />
        <span>Linkedin</span>
      </Flex>
    ),
    value: "linkedin"
  },
  pinterest: {
    icon: <IconBrandPinterest />,
    label: (
      <Flex gap="small" align="center">
        <IconBrandPinterest />
        <span>Pinterest</span>
      </Flex>
    ),
    value: "pinterest"
  },
  facebook: {
    icon: <IconBrandFacebook />,
    label: (
      <Flex gap="small" align="center">
        <IconBrandFacebook />
        <span>Facebook</span>
      </Flex>
    ),
    value: "facebook"
  },
  tiktok: {
    icon: <IconBrandTiktok />,
    label: (
      <Flex gap="small" align="center">
        <IconBrandTiktok />
        <span>Tiktok</span>
      </Flex>
    ),
    value: "tiktok"
  },
  threads: {
    icon: <IconBrandThreads />,
    label: (
      <Flex gap="small" align="center">
        <IconBrandThreads />
        <span>Threads</span>
      </Flex>
    ),
    value: "threads"
  },
}

export const platformsOptions = Object.keys(platforms).map((platform: string) => ({
  label: platforms[platform].label,
  value: platforms[platform].value
}))

export const captionLengthOptions = [
  {
    label: "Very short",
    value: 50
  },
  {
    label: "Short",
    value: 100
  },
  {
    label: "Normal",
    value: 150
  },
  {
    label: "Medium",
    value: 250
  },
  {
    label: "Long",
    value: 500
  },
]

export const avoidWords = [
  "as you",
  "remember",
  "embrace",
  "by",
  "by incorporating",
  "ready to",
  "are you",
  "ever wondered",
  "discover",
  "let's",
  "dive",
  "unlock",
  "transform",
  "the secrets",
  "breeze",
  "effortlessly",
  "wondering",
  "welcome",
  "journey",
  "in conclusion",
  "consequently",
  "furthermore",
  "in addition to",
  "extremely",
  "significantly",
  "in today's world",
  "explore",
  "Unraveling",
  "remember",
  "check out",
  "debunked",
  "myths",
  "good luck",
  "efficiently",
  "Demystified",
  "embark",
  "However",
  "Unleash",
  "enjoyable",
  "This comprehensive guide",
  "help you understand",
  "the science behind",
  "You've got this",
  "don't worry",
  "This guide",
  "You might be thinking"
]