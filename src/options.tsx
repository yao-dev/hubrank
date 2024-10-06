import { IconBrandFacebook, IconBrandInstagram, IconBrandLinkedin, IconBrandPinterest, IconBrandThreads, IconBrandTiktok, IconBrandX } from "@tabler/icons-react";
import { Flex } from "antd";
import Link from "next/link";

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
    "label": "3 headings",
  },
  {
    "value": "4",
    "label": "4 headings",
  },
  {
    "value": "5",
    "label": "5 headings",
  },
  {
    "value": "6",
    "label": "6 headings",
  },
  {
    "value": "7",
    "label": "7 headings",
  },
  {
    "value": "8",
    "label": "8 headings",
  },
  {
    "value": "9",
    "label": "9 headings",
  },
  {
    "value": "10",
    "label": "10 headings",
  },
]

export const headlineTypes = [
  {
    "value": "blog",
    "label": "Blog",
  },
  {
    "value": "youtube",
    "label": "Youtube",
  },
  {
    "value": "linkedin",
    "label": "Linkedin",
  },
  {
    "value": "essay",
    "label": "Essay",
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
  {
    label: "Product",
    value: "Product",
  },
  {
    label: "Table",
    value: "Table",
  },
  {
    label: "Review",
    value: "Review",
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

// export const captionLengthOptions = [
//   {
//     label: "Short",
//     value: 150
//   },
//   {
//     label: "Normal",
//     value: 250
//   },
//   {
//     label: "Long",
//     value: 400
//   },
// ]

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
  "You might be thinking",
  "Harnessing",
  "For more",
]

export const captionTypes = [
  "Comment",
  "Rephrase post",
  "Motivational",
  "Networking",
  "Question for engaement",
  "List & Tips",
  "How to, Step by Step, Guide",
  "Ask a Poll",
  "Personal Insight",
  // "News/Updates",
  "Humor",
  "Call to Action",
  "Workplace Advice",
  "Leadership Insight",
  "Inspirational Quote",
  // "Customer Testimonial",
  "Industry Insight",
  "Challenge or Competition",
  "Behind the Scenes",
  "Opinion or Hot Take",
  "Shoutout or Appreciation",
  "Event Announcement"
]

export const captionCallToActions = [
  "DM me",
  "Subscribe",
  "Comment below",
  "Give a like",
  "Share this post",
  "Tag a friend",
  "Follow for more",
  "Click the link in bio",
  "Retweet",
  "Save this post",
  "Join the conversation",
  "Send me a message",
  "Sign up",
  "Leave a review",
  "Ask me anything",
  "Visit my website",
  "Watch my video"
]


export const competitors = {
  "jasper.ai": {
    logo: "https://cdn.prod.website-files.com/60e5f2de011b86acebc30db7/665dd9c1792c38c09c7d74ec_Jasper%20Logo%20Lockup%20-%20Dark%20Khaki.svg",
    name: "Jasper.ai",
    url: "https://jasper.ai",
    description: (
      <p className="text-lg">
        <Link href="https://jasper.ai" className="text-primary-500 font-semibold">Jasper.ai</Link> is an AI-powered content creation platform designed to help businesses and individuals generate high-quality written content quickly and efficiently. It uses advanced natural language processing (NLP) models to assist in creating various types of content, such as blog posts, social media updates, marketing copy, and more. Jasper.ai offers tools to optimize content for SEO, tailor tone and style, and improve overall writing productivity.
      </p>
    ),
    keywords: [
      "jasper ai",
      "conversion ai",
      "ai jasper",
      "jasper ai writing",
      "jarvis ai writing",
      "jasper ai writer",
      "jasper ai tool",
      "jasper copywriting",
      "jasper ai free trial",
      "hey jasper ai",
      "jasper content creation",
      "jasper ai free",
      "jasper software",
      "jasper writing assistant",
      "jarvis ai writer",
      "jasper blog writing",
      "jasper io",
      "jasper writing",
      "jarvis ai",
      "jasper writing tool",
      "jarvis copywriting",
      "jasper ai essay",
      "jasper ai content",
      "jasper content",
      "jarvis writing",
      "jasper writing ai",
      "jarvis ai copywriting",
      "jasper ai copywriting",
      "jasper ai trial",
      "jasper ai software",
      "jasper free trial",
      "ai copywriting",
      "jasper ai logo",
      "jasper content improver",
      "jasper ai writing tool",
      "marketing ai tools",
      "jasper ai pricing",
      "ai marketing tools",
      "jasper bot",
      "jarvis conversion ai",
      "jasper ai marketing",
      "jasper chat",
      "jasper marketing",
      "ai marketing platform",
      "marketing ai",
      "jasper openai",
      "jasper ai writing software",
      "jasper article writer",
      "ai marketing software",
      "copywriting ai"
    ]
  },
  "copy.ai": {
    logo: "https://cdn.prod.website-files.com/628288c5cd3e8411b90a36a4/659e8f4c92a0028e36e42623_logo_kerning-fix.svg",
    name: "Copy.ai",
    url: "https://copy.ai",
    description: (
      <p className="text-lg">
        <Link href="https://copy.ai" className="text-primary-500 font-semibold">Copy.ai</Link> is an AI-driven content creation tool that helps users generate a wide range of written content, including social media posts, marketing copy, blog articles, and product descriptions. It leverages natural language processing to create high-quality text based on user input and preferences, allowing businesses and individuals to quickly produce engaging and tailored content. Copy.ai is designed to streamline the writing process, saving time and enhancing creativity.
      </p>
    ),
    keywords: [
      "copywriting ai",
      "copy ai",
      "ai copy",
      "ai copywriting",
      "ai copy writer",
      "app copy ai",
      "copy writing ai",
      "ai for copywriting",
      "ai copywriting tools",
      "copy ai free",
      "ai copy writing",
      "copy io",
      "copy ai tools",
      "ai ad copy",
      "ai copy generator",
      "marketing copy ai",
      "copywriting tools",
      "ad copy ai",
      "copyai login",
      "ai marketing copy",
      "ai copywriter free",
      "copywriting ai tools",
      "ai generated copy",
      "best ai copywriter",
      "best copywriting ai",
      "ai copy editor",
      "copywriting software",
      "free copy ai",
      "ai copywriting software",
      "best ai copywriting software",
      "copy writing tools",
      "copy writing",
      "copy generator",
      "ai content writer",
      "copywriting ai free",
      "content writing ai",
      "website copy ai",
      "best ai for copywriting",
      "copywriting app",
      "copywriting website",
      "free ai copywriter",
      "content ai",
      "copy writing tool",
      "free ai copywriting tool",
      "ai ad writer",
      "copywriting ai software",
      "best ai copy generator",
      "sales copy ai",
      "copy ai free trial",
      "ai copy tools"
    ]
  },
  "reword": {
    logo: "https://cdn.prod.website-files.com/634d41276b882236cc52de2c/634d904513981b61b7129694_Reword%20Small.svg",
    name: "Reword",
    url: "https://reword.com",
    description: (
      <p className="text-lg">
        <Link href="https://reword.com" className="text-primary-500 font-semibold">Reword.com</Link> offers a collaborative AI writing tool that allows users to create content with the help of an AI assistant trained specifically on their unique writing style. The platform is designed to aid in producing high-quality, people-first articles by offering suggestions, citations, and research tools. It emphasizes collaboration between the user and the AI to maintain a consistent tone and improve content performance.
      </p>
    ),
    keywords: [
      "reword ai",
      "writing ai",
      "ai writer",
      "ai for writing",
      "ai write",
      "ai writing tool",
      "ai writing tools",
      "ai article writer",
      "ai tool for writing",
      "best ai writer",
      "ai writing software",
      "ai that writes for you",
      "ai writing assistant",
      "best ai writing tools",
      "ai content writer",
      "ai tools for writing",
      "ai help with writing",
      "free ai writer",
      "ai writer free",
      "ai help writing",
      "ai writing generator",
      "ai blog writer",
      "ai bot writer",
      "best ai writing software",
      "ai article generator",
      "best ai for writing",
      "free ai writing generator",
      "ai writing app",
      "article writer",
      "ai content generator",
      "ai reword",
      "content writing ai",
      "ai tools for content writing",
      "ai writer generator",
      "best ai content writer",
      "ai writing generator free",
      "ai writing bot",
      "ai for writing articles",
      "ai to help you write",
      "ai write for me",
      "ai to write articles",
      "ai software for writing",
      "writing ai generator",
      "writing ai free",
      "free ai writing",
      "best writing ai",
      "free ai writing tools",
      "ai writing program",
      "content generator ai",
      "article generator ai"
    ]
  },
  "copysmith.ai": {
    logo: "",
    whiteLogo: true,
    name: "Copysmith.ai",
    url: "https://copysmith.ai",
    description: (
      <p className="text-lg">
        <Link href="https://copysmith.ai" className="text-primary-500 font-semibold">Copysmith.ai</Link> provides AI-powered tools to help businesses create high-quality content across various channels. The platform offers solutions like product description generation, SEO-optimized articles, and content tailored to specific brand voices, streamlining content production for marketing, e-commerce, and other business needs.
      </p>
    ),
    keywords: [
      "ai copywriting",
      "copywriting ai",
      "copy writing ai",
      "ai copy writer",
      "copy ai",
      "copywriting software",
      "ai for copywriting",
      "ai copywriting tools",
      "ai copy writing",
      "ai content writer",
      "ai copywriting free",
      "copywriting tools",
      "ai copy generator",
      "best ai copywriter",
      "ai writing",
      "content writing ai",
      "copywriting ai free",
      "free ai copywriting tool",
      "best copywriting ai",
      "ai content generator",
      "copy writing",
      "copy generator",
      "copywriting ai tools",
      "writing ai",
      "best free ai content generator",
      "ai copy generator free",
      "rytr ai",
      "ai for writing",
      "content generator ai",
      "ai content writer free",
      "ai for content writing",
      "ai writing tool",
      "ai tools for content writing",
      "ai copywriting software",
      "ai write",
      "best ai copy generator",
      "best ai for copywriting",
      "ai writing software",
      "content creator ai",
      "content ai writer",
      "ai content",
      "free ai content generator",
      "ai blog writer",
      "ai tool for writing",
      "ai tools for writing",
      "writing ai free",
      "ai writing tools",
      "copy writing tools",
      "ai writing generator",
      "ai article generator"
    ]
  },
  "machined.ai": {
    logo: "https://cdn.sanity.io/images/u0v1th4q/production/feaf8d47262cf58f407f442366295c55b7f09d0d-256x256.svg?fp-x=0.5&fp-y=0.5&w=256&sharp=100&q=75&auto=format",
    name: "Machined.ai",
    url: "https://machined.ai",
    description: (
      <p className="text-lg">
        <Link href="https://machined.ai" className="text-primary-500 font-semibold">Machined.ai</Link> is a tool that automates the creation of SEO-optimized content clusters. It handles everything from keyword research to content writing and interlinking, producing large volumes of articles designed to boost search engine rankings. The platform integrates directly with content management systems like WordPress and Webflow, enabling seamless publishing.
      </p>
    ),
    keywords: [
      "ai copywriting",
      "copywriting ai",
      "copy writing ai",
      "ai copy writer",
      "copy ai",
      "copywriting software",
      "ai for copywriting",
      "ai copywriting tools",
      "ai copy writing",
      "ai content writer",
      "ai copywriting free",
      "copywriting tools",
      "ai copy generator",
      "best ai copywriter",
      "ai writing",
      "content writing ai",
      "copywriting ai free",
      "free ai copywriting tool",
      "best copywriting ai",
      "ai content generator",
      "copy writing",
      "copy generator",
      "copywriting ai tools",
      "writing ai",
      "best free ai content generator",
      "ai copy generator free",
      "rytr ai",
      "ai for writing",
      "content generator ai",
      "ai content writer free",
      "ai for content writing",
      "ai writing tool",
      "ai tools for content writing",
      "ai copywriting software",
      "ai write",
      "best ai copy generator",
      "best ai for copywriting",
      "ai writing software",
      "content creator ai",
      "content ai writer",
      "ai content",
      "free ai content generator",
      "ai blog writer",
      "ai tool for writing",
      "ai tools for writing",
      "writing ai free",
      "ai writing tools",
      "copy writing tools",
      "ai writing generator",
      "ai article generator"
    ]
  },
  "tryjournalist.com": {
    logo: "",
    whiteLogo: true,
    name: "Journalist AI",
    url: "https://tryjournalist.com",
    description: (
      <p className="text-lg">
        <Link href="https://tryjournalist.com" className="text-primary-500 font-semibold">Journalist AI</Link> is a platform that offers AI-driven tools for automating content creation and SEO tasks. It provides features like an AI SEO writer, listicle generator, and news writer, allowing users to quickly generate optimized articles. The platform also includes automation tools for managing blogs, keyword research, social media syndication, and internal/external linking. It supports integrations with popular platforms like WordPress, Shopify, Wix, and others, making it easier to publish and manage content across different sites.
      </p>
    ),
    keywords: [
      "ai article writer",
      "article writer",
      "ai article generator",
      "ai blog writer",
      "article writing ai",
      "article generator ai",
      "ai article writer free",
      "ai for writing articles",
      "ai to write articles",
      "ai writer",
      "free ai article writer",
      "ai blog writer free",
      "content writing ai",
      "blog writing ai",
      "seo ai writer",
      "ai blog generator",
      "ai content writer",
      "ai seo content generator",
      "ai blog post writer",
      "blog writer ai",
      "article ai writer",
      "blog ai writer",
      "ai for blog writing",
      "writing ai",
      "ai writer free",
      "free ai writer",
      "article generator",
      "article ai",
      "ai for writing",
      "best ai writer",
      "free ai blog writer",
      "ai generated articles",
      "ai content generator",
      "blog writer",
      "article creator",
      "ai writing generator",
      "ai article generator free",
      "ai write",
      "ai writer generator",
      "ai writing tool",
      "ai content writer free",
      "ai blog content generator",
      "ai for content writing",
      "best ai blog writer",
      "content ai writer",
      "article maker",
      "best ai content writer",
      "ai tool for writing",
      "ai tools for content writing",
      "content generator ai"
    ]
  },
  "alliai.com": {
    logo: "https://www.alliai.com/wp-content/uploads/2022/08/Alli-AI-logo.svg",
    name: "Alli AI",
    url: "https://alliai.com",
    description: (
      <p className="text-lg">
        <Link href="https://alliai.com" className="text-primary-500 font-semibold">Alli AI</Link> is an SEO automation platform that enables users to optimize and manage SEO tasks across websites efficiently. It allows for on-page SEO automation, real-time deployment of code changes, keyword tracking, and site audits, all from a single dashboard. The platform is designed to streamline and scale SEO efforts, making it particularly useful for agencies and businesses managing multiple sites.
      </p>
    ),
    keywords: [
      "ai seo",
      "alli ai",
      "ai for seo",
      "seo ai tools",
      "ai seo tools",
      "ai seo optimization",
      "ai seo software",
      "seo website",
      "seo software",
      "ai tools for seo",
      "seo optimization",
      "best seo tools",
      "free ai seo tools",
      "best seo",
      "seo ai free",
      "best ai seo software",
      "seo for my website",
      "seo tools",
      "automated seo",
      "best ai for seo",
      "seo help",
      "on page seo",
      "seo optimization tools",
      "seo ai writer",
      "seo software tools",
      "search engine optimization",
      "free seo",
      "seo tools free",
      "ai seo content generator",
      "seo agency",
      "seo ranking",
      "seo marketing",
      "seo search engine optimization",
      "seo optimization ai",
      "seo optimisation",
      "seo platforms",
      "seo analysis",
      "all in one seo",
      "seo ai generator",
      "seo web",
      "seo companies",
      "best free seo tools",
      "content ai",
      "content optimization tool",
      "seo writer",
      "seo services",
      "engine optimization",
      "website seo optimization",
      "seo search",
      "seo automation tool"
    ]
  },
  "anyword.com": {
    logo: "https://cdn.prod.website-files.com/65a5365ee6f4219bc2d2f822/65ae548143e3b5eca08c4093_Logo.svg",
    name: "Anyword",
    url: "https://anyword.com",
    description: (
      <p className="text-lg">
        <Link href="https://anyword.com" className="text-primary-500 font-semibold">Anyword</Link> is an AI-driven writing platform designed for marketing teams. It assists in creating content by predicting performance, analyzing copy, and maintaining brand voice consistency across various channels, such as social media, emails, and ads.
      </p>
    ),
    keywords: [
      "ai copywriting",
      "copy writing ai",
      "copywriting ai",
      "ai copy writing",
      "ai copy generator",
      "copy ai",
      "ai copy writer",
      "ai for copywriting",
      "ai copywriting tools",
      "ai copywriting free",
      "anyword ai writer",
      "ai writing",
      "copy generator",
      "ai content writer",
      "writing ai",
      "ai for writing",
      "ai writing tools",
      "ai writing tool",
      "ai write",
      "free ai copywriting tool",
      "copywriting ai free",
      "content writer ai",
      "ai writing generator",
      "ai content generator",
      "ai tool for writing",
      "ai ad writer",
      "copywriting tools",
      "ai copy generator free",
      "writing ai free",
      "ai tools for writing",
      "free ai writing generator",
      "best ai copywriter",
      "free ai content generator",
      "free ai writing tools",
      "copywriting ai tools",
      "ai content writer free",
      "ai tools for content writing",
      "best free ai content generator",
      "ai writing generator free",
      "content generator ai",
      "free ai writer",
      "copywriting software",
      "ai writer free",
      "free ai writing",
      "ai content generator free",
      "ai writing software",
      "writing ai tools",
      "free copy ai",
      "writing ai generator",
      "free writing ai"
    ]
  },
  "seo.ai": {
    logo: "https://cdn.prod.website-files.com/627a5f467d5ec9539d88f0bc/6572cbbe08213b709d66714d_SEO-AI-logo-white.svg",
    whiteLogo: true,
    name: "SEO AI",
    url: "https://seo.ai",
    description: (
      <p className="text-lg">
        <Link href="https://seo.ai" className="text-primary-500 font-semibold">SEO AI</Link> is a platform that uses AI to help create and optimize SEO-friendly content. It offers tools for keyword research, content generation, and on-page optimization. The platform also provides AI-driven suggestions for titles, meta descriptions, and internal linking, making it easier to produce content that ranks well on search engines.
      </p>
    ),
    keywords: [
      "seo ai",
      "ai seo tools",
      "seo ai tools",
      "ai seo optimization",
      "ai for seo",
      "ai seo content generator",
      "seo ai writer",
      "free ai seo tools",
      "seo ai generator",
      "seo ai free",
      "seo writer",
      "ai tools for seo",
      "seo content writer",
      "ai seo software",
      "best ai for seo",
      "ai seo writer",
      "seo text generator",
      "ai seo content writing",
      "seo optimization ai",
      "best ai seo software",
      "free seo tools",
      "seo tools",
      "seo writing tools",
      "ai writer",
      "seo blog writer",
      "free seo",
      "best seo tools",
      "seo keywords",
      "content ai",
      "ai content creator",
      "seo with ai",
      "seo optimization tools",
      "ai seo generator",
      "seo help",
      "best ai writer",
      "ai content writer",
      "ai content creation",
      "ai tools for content writing",
      "ai keyword research",
      "ai content generator",
      "free seo ai",
      "best seo",
      "seo software",
      "best seo ai",
      "content optimization tool",
      "best free seo tools",
      "ai website optimization",
      "seo keyword research",
      "seo search tools",
      "seo article writing"
    ]
  },
  "frase.io": {
    logo: "https://www.frase.io/wp-content/uploads/2020/11/cropped-frase-logo-white.png",
    whiteLogo: true,
    name: "Frase.io",
    url: "https://frase.io",
    description: (
      <p className="text-lg">
        <Link href="https://frase.io" className="text-primary-500 font-semibold">Frase.io</Link> offers a platform that combines AI with SEO tools to help content creators research, write, and optimize content more efficiently. It provides features like SERP analysis, content briefs, and an AI-powered text editor to produce SEO-optimized articles.
      </p>
    ),
    keywords: [
      "frase ai",
      "ai seo",
      "ai seo optimization",
      "content optimization tool",
      "ai seo tools",
      "seo ai writer",
      "ai for seo",
      "seo ai tools",
      "frase ai writer",
      "frase seo",
      "ai seo content generator",
      "content optimizer",
      "ai seo writer",
      "seo writer",
      "ai seo content writing",
      "seo content writer",
      "seo writing tools",
      "content ai",
      "seo optimization ai",
      "ai content creator",
      "ai tools for seo",
      "seo text generator",
      "ai content writer",
      "free ai seo tools",
      "best ai for seo",
      "ai content creation",
      "seo content",
      "seo content creator",
      "seo ai free",
      "content writing tools",
      "content writer ai",
      "seo optimization tools",
      "content creation ai",
      "seo ai generator",
      "content creator ai",
      "ai tools for content writing",
      "best seo tools",
      "ai seo software",
      "seo tool",
      "ai writer",
      "seo writing assistant",
      "best ai writer",
      "seo optimization",
      "seo content ai",
      "seo marketing",
      "best seo",
      "surfer seo",
      "ai content generator",
      "seo content writing tools",
      "seo blog writer"
    ]
  },
  "blogseo.ai": {
    logo: "https://cdn.prod.website-files.com/6481bb338e41f40e20299ed3/6492d52c3a91a848827bda61_logo%20V3.svg",
    whiteLogo: true,
    name: "Blog SEO AI",
    url: "https://blogseo.ai",
    description: (
      <p className="text-lg">
        <Link href="https://blogseo.ai" className="text-primary-500 font-semibold">Blog SEO AI</Link> offers AI-powered tools for creating and optimizing SEO-friendly blog content. It features keyword research, content generation, and auto-blogging capabilities, allowing users to produce and publish blog posts automatically on a schedule.
      </p>
    ),
    keywords: [
      "seo ai",
      "seo ai writer",
      "seo blog writing",
      "ai for seo",
      "seo ai tools",
      "ai seo tools",
      "ai seo optimization",
      "seo writing",
      "seo blog",
      "ai seo content generator",
      "ai seo writer",
      "seo content writer",
      "best ai blog writer",
      "seo ai generator",
      "ai writer",
      "ai blog content generator",
      "best ai writer",
      "ai blog post generator",
      "ai seo content writing",
      "ai article generator",
      "seo ai free",
      "free ai seo tools",
      "seo text generator",
      "ai tools for seo",
      "article generator ai",
      "blog post writer",
      "ai content writer",
      "best ai for seo",
      "blog title generator",
      "ai content generator",
      "seo title generator",
      "ai tools for content writing",
      "seo tools",
      "content writer ai",
      "seo writing tools",
      "seo article writing",
      "best seo",
      "content generator ai",
      "best seo tools",
      "website seo",
      "content ai",
      "ai seo software",
      "best ai blog writing tool",
      "seo writing assistant",
      "blog writing tools",
      "content generator",
      "seo optimization ai",
      "ai content creator",
      "free ai blog content generator",
      "free seo"
    ]
  },
  "byword.ai": {
    logo: "https://d1muf25xaso8hp.cloudfront.net/https%3A%2F%2Fc0db431ff5d7a606bdae1e9d4102a6bb.cdn.bubble.io%2Ff1679762992290x496676121664037000%2Fout%2520%25281%2529%2520%25281%2529%2520%25282%2529.png?w=128&h=34&auto=compress&dpr=2&fit=max",
    name: "Byword",
    url: "https://byword.ai",
    description: (
      <p className="text-lg">
        <Link href="https://byword.ai" className="text-primary-500 font-semibold">Byword.ai</Link> is a AI Writing Platform designed with the capabilities to generate high-quality articles with ease. This tool leverages advanced Artificial Intelligence technology to effectively scale the content creation process and maintain quality output.
      </p>
    ),
    keywords: [
      "seo ai",
      "seo ai writer",
      "seo blog writing",
      "ai for seo",
      "seo ai tools",
      "ai seo tools",
      "ai seo optimization",
      "seo writing",
      "seo blog",
      "ai seo content generator",
      "ai seo writer",
      "seo content writer",
      "best ai blog writer",
      "seo ai generator",
      "ai writer",
      "ai blog content generator",
      "best ai writer",
      "ai blog post generator",
      "ai seo content writing",
      "ai article generator",
      "seo ai free",
      "free ai seo tools",
      "seo text generator",
      "ai tools for seo",
      "article generator ai",
      "blog post writer",
      "ai content writer",
      "best ai for seo",
      "blog title generator",
      "ai content generator",
      "seo title generator",
      "ai tools for content writing",
      "seo tools",
      "content writer ai",
      "seo writing tools",
      "seo article writing",
      "best seo",
      "content generator ai",
      "best seo tools",
      "website seo",
      "content ai",
      "ai seo software",
      "best ai blog writing tool",
      "seo writing assistant",
      "blog writing tools",
      "content generator",
      "seo optimization ai",
      "ai content creator",
      "free ai blog content generator",
      "free seo"
    ]
  }
}

export const competitorList = Object.entries(competitors).map(([key, value]) => ({
  ...value,
  slug: key
}))

export const imageStyles = [
  {
    "name": "3D Model",
    "prompt": "professional 3d model {prompt} . octane render, highly detailed, volumetric, dramatic lighting",
    "negative_prompt": "ugly, deformed, noisy, low poly, blurry, painting",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Analog Film",
    "prompt": "analog film photo {prompt} . faded film, desaturated, 35mm photo, grainy, vignette, vintage, Kodachrome, Lomography, stained, highly detailed, found footage",
    "negative_prompt": "painting, drawing, illustration, glitch, deformed, mutated, cross-eyed, ugly, disfigured",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Anime",
    "prompt": "anime artwork {prompt} . anime style, key visual, vibrant, studio anime, highly detailed",
    "negative_prompt": "photo, deformed, black and white, realism, disfigured, low contrast",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Cinematic",
    "prompt": "cinematic film still {prompt} . shallow depth of field, vignette, highly detailed, high budget, bokeh, cinemascope, moody, epic, gorgeous, film grain, grainy",
    "negative_prompt": "anime, cartoon, graphic, text, painting, crayon, graphite, abstract, glitch, deformed, mutated, ugly, disfigured",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Comic Book",
    "prompt": "comic {prompt} . graphic illustration, comic art, graphic novel art, vibrant, highly detailed",
    "negative_prompt": "photograph, deformed, glitch, noisy, realistic, stock photo",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Craft Clay",
    "prompt": "play-doh style {prompt} . sculpture, clay art, centered composition, Claymation",
    "negative_prompt": "sloppy, messy, grainy, highly detailed, ultra textured, photo",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Digital Art",
    "prompt": "concept art {prompt} . digital artwork, illustrative, painterly, matte painting, highly detailed",
    "negative_prompt": "photo, photorealistic, realism, ugly",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Enhance",
    "prompt": "breathtaking {prompt} . award-winning, professional, highly detailed",
    "negative_prompt": "ugly, deformed, noisy, blurry, distorted, grainy",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Fantasy Art",
    "prompt": "ethereal fantasy concept art of {prompt} . magnificent, celestial, ethereal, painterly, epic, majestic, magical, fantasy art, cover art, dreamy",
    "negative_prompt": "photographic, realistic, realism, 35mm film, dslr, cropped, frame, text, deformed, glitch, noise, noisy, off-center, deformed, cross-eyed, closed eyes, bad anatomy, ugly, disfigured, sloppy, duplicate, mutated, black and white",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Isometric",
    "prompt": "isometric style {prompt} . vibrant, beautiful, crisp, detailed, ultra detailed, intricate",
    "negative_prompt": "deformed, mutated, ugly, disfigured, blur, blurry, noise, noisy, realistic, photographic",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Line Art",
    "prompt": "line art drawing {prompt} . professional, sleek, modern, minimalist, graphic, line art, vector graphics",
    "negative_prompt": "anime, photorealistic, 35mm film, deformed, glitch, blurry, noisy, off-center, deformed, cross-eyed, closed eyes, bad anatomy, ugly, disfigured, mutated, realism, realistic, impressionism, expressionism, oil, acrylic",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Lowpoly",
    "prompt": "low-poly style {prompt} . low-poly game art, polygon mesh, jagged, blocky, wireframe edges, centered composition",
    "negative_prompt": "noisy, sloppy, messy, grainy, highly detailed, ultra textured, photo",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Neonpunk",
    "prompt": "neonpunk style {prompt} . cyberpunk, vaporwave, neon, vibes, vibrant, stunningly beautiful, crisp, detailed, sleek, ultramodern, magenta highlights, dark purple shadows, high contrast, cinematic, ultra detailed, intricate, professional",
    "negative_prompt": "painting, drawing, illustration, glitch, deformed, mutated, cross-eyed, ugly, disfigured",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Origami",
    "prompt": "origami style {prompt} . paper art, pleated paper, folded, origami art, pleats, cut and fold, centered composition",
    "negative_prompt": "noisy, sloppy, messy, grainy, highly detailed, ultra textured, photo",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Photographic",
    "prompt": "cinematic photo {prompt} . 35mm photograph, film, bokeh, professional, 4k, highly detailed",
    "negative_prompt": "drawing, painting, crayon, sketch, graphite, impressionist, noisy, blurry, soft, deformed, ugly",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Pixel Art",
    "prompt": "pixel-art {prompt} . low-res, blocky, pixel art style, 8-bit graphics",
    "negative_prompt": "sloppy, messy, blurry, noisy, highly detailed, ultra textured, photo, realistic",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Texture",
    "prompt": "texture {prompt} top down close-up",
    "negative_prompt": "ugly, deformed, noisy, blurry",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Ads Advertising",
    "prompt": "advertising poster style {prompt} . Professional, modern, product-focused, commercial, eye-catching, highly detailed",
    "negative_prompt": "noisy, blurry, amateurish, sloppy, unattractive",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Ads Automotive",
    "prompt": "automotive advertisement style {prompt} . sleek, dynamic, professional, commercial, vehicle-focused, high-resolution, highly detailed",
    "negative_prompt": "noisy, blurry, unattractive, sloppy, unprofessional",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Ads Corporate",
    "prompt": "corporate branding style {prompt} . professional, clean, modern, sleek, minimalist, business-oriented, highly detailed",
    "negative_prompt": "noisy, blurry, grungy, sloppy, cluttered, disorganized",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Ads Fashion Editorial",
    "prompt": "fashion editorial style {prompt} . high fashion, trendy, stylish, editorial, magazine style, professional, highly detailed",
    "negative_prompt": "outdated, blurry, noisy, unattractive, sloppy",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Ads Food Photography",
    "prompt": "food photography style {prompt} . appetizing, professional, culinary, high-resolution, commercial, highly detailed",
    "negative_prompt": "unappetizing, sloppy, unprofessional, noisy, blurry",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Ads Gourmet Food Photography",
    "prompt": "gourmet food photo of {prompt} . soft natural lighting, macro details, vibrant colors, fresh ingredients, glistening textures, bokeh background, styled plating, wooden tabletop, garnished, tantalizing, editorial quality",
    "negative_prompt": "cartoon, anime, sketch, grayscale, dull, overexposed, cluttered, messy plate, deformed",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Ads Luxury",
    "prompt": "luxury product style {prompt} . elegant, sophisticated, high-end, luxurious, professional, highly detailed",
    "negative_prompt": "cheap, noisy, blurry, unattractive, amateurish",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Ads Real Estate",
    "prompt": "real estate photography style {prompt} . professional, inviting, well-lit, high-resolution, property-focused, commercial, highly detailed",
    "negative_prompt": "dark, blurry, unappealing, noisy, unprofessional",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Ads Retail",
    "prompt": "retail packaging style {prompt} . vibrant, enticing, commercial, product-focused, eye-catching, professional, highly detailed",
    "negative_prompt": "noisy, blurry, amateurish, sloppy, unattractive",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Abstract",
    "prompt": "abstract style {prompt} . non-representational, colors and shapes, expression of feelings, imaginative, highly detailed",
    "negative_prompt": "realistic, photographic, figurative, concrete",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Abstract Expressionism",
    "prompt": "abstract expressionist painting {prompt} . energetic brushwork, bold colors, abstract forms, expressive, emotional",
    "negative_prompt": "realistic, photorealistic, low contrast, plain, simple, monochrome",
    "image": "https://stable-diffusion-art.com/wp-content/uploads/2023/08/artstyle-abstract-expressionism_woman_1-1024x701.png"
  },
  {
    "name": "Art Deco",
    "prompt": "art deco style {prompt} . geometric shapes, bold colors, luxurious, elegant, decorative, symmetrical, ornate, detailed",
    "negative_prompt": "ugly, deformed, noisy, blurry, low contrast, realism, photorealistic, modernist, minimalist",
    "image": "https://stable-diffusion-art.com/wp-content/uploads/2023/08/artstyle-art-deco_woman_0-1024x701.png"
  },
  {
    "name": "Art Nouveau",
    "prompt": "art nouveau style {prompt} . elegant, decorative, curvilinear forms, nature-inspired, ornate, detailed",
    "negative_prompt": "ugly, deformed, noisy, blurry, low contrast, realism, photorealistic, modernist, minimalist",
    "image": "https://stable-diffusion-art.com/wp-content/uploads/2023/08/artstyle-art-nouveau_woman_0-1024x701.png"
  },
  {
    "name": "Constructivist",
    "prompt": "constructivist style {prompt} . geometric shapes, bold colors, dynamic composition, propaganda art style",
    "negative_prompt": "realistic, photorealistic, low contrast, plain, simple, abstract expressionism",
    "image": "https://stable-diffusion-art.com/wp-content/uploads/2023/08/artstyle-constructivist_woman_2-1024x701.png"
  },
  {
    "name": "Cubist",
    "prompt": "cubist artwork {prompt} . geometric shapes, abstract, innovative, revolutionary",
    "negative_prompt": "anime, photorealistic, 35mm film, deformed, glitch, low contrast, noisy",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Expressionist",
    "prompt": "expressionist {prompt} . raw, emotional, dynamic, distortion for emotional effect, vibrant, use of unusual colors, detailed",
    "negative_prompt": "realism, symmetry, quiet, calm, photo",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Graffiti",
    "prompt": "graffiti style {prompt} . street art, vibrant, urban, detailed, tag, mural",
    "negative_prompt": "ugly, deformed, noisy, blurry, low contrast, realism, photorealistic",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Hyperrealism",
    "prompt": "hyperrealistic art {prompt} . extremely high-resolution details, photographic, realism pushed to extreme, fine texture, incredibly lifelike",
    "negative_prompt": "simplified, abstract, unrealistic, impressionistic, low resolution",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Impressionist",
    "prompt": "impressionist painting {prompt} . loose brushwork, vibrant color, light and shadow play, captures feeling over form",
    "negative_prompt": "anime, photorealistic, 35mm film, deformed, glitch, low contrast, noisy",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Pointillism",
    "prompt": "pointillism style {prompt} . composed entirely of small, distinct dots of color, vibrant, highly detailed",
    "negative_prompt": "line drawing, smooth shading, large color fields, simplistic",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Pop Art",
    "prompt": "pop Art style {prompt} . bright colors, bold outlines, popular culture themes, ironic or kitsch",
    "negative_prompt": "ugly, deformed, noisy, blurry, low contrast, realism, photorealistic, minimalist",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Psychedelic",
    "prompt": "psychedelic style {prompt} . vibrant colors, swirling patterns, abstract forms, surreal, trippy",
    "negative_prompt": "monochrome, black and white, low contrast, realistic, photorealistic, plain, simple",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Renaissance",
    "prompt": "renaissance style {prompt} . realistic, perspective, light and shadow, religious or mythological themes, highly detailed",
    "negative_prompt": "ugly, deformed, noisy, blurry, low contrast, modernist, minimalist, abstract",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Steampunk",
    "prompt": "steampunk style {prompt} . antique, mechanical, brass and copper tones, gears, intricate, detailed",
    "negative_prompt": "deformed, glitch, noisy, low contrast, anime, photorealistic",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Surrealist",
    "prompt": "surrealist art {prompt} . dreamlike, mysterious, provocative, symbolic, intricate, detailed",
    "negative_prompt": "anime, photorealistic, realistic, deformed, glitch, noisy, low contrast",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Typography",
    "prompt": "typographic art {prompt} . stylized, intricate, detailed, artistic, text-based",
    "negative_prompt": "ugly, deformed, noisy, blurry, low contrast, realism, photorealistic",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Watercolor",
    "prompt": "watercolor painting {prompt} . vibrant, beautiful, painterly, detailed, textural, artistic",
    "negative_prompt": "anime, photorealistic, 35mm film, deformed, glitch, low contrast, noisy",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Futuristic Biomechanical",
    "prompt": "biomechanical style {prompt} . blend of organic and mechanical elements, futuristic, cybernetic, detailed, intricate",
    "negative_prompt": "natural, rustic, primitive, organic, simplistic",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Futuristic Biomechanical Cyberpunk",
    "prompt": "biomechanical cyberpunk {prompt} . cybernetics, human-machine fusion, dystopian, organic meets artificial, dark, intricate, highly detailed",
    "negative_prompt": "natural, colorful, deformed, sketch, low contrast, watercolor",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Futuristic Cybernetic",
    "prompt": "cybernetic style {prompt} . futuristic, technological, cybernetic enhancements, robotics, artificial intelligence themes",
    "negative_prompt": "ugly, deformed, noisy, blurry, low contrast, realism, photorealistic, historical, medieval",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Futuristic Cybernetic Robot",
    "prompt": "cybernetic robot {prompt} . android, AI, machine, metal, wires, tech, futuristic, highly detailed",
    "negative_prompt": "organic, natural, human, sketch, watercolor, low contrast",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Futuristic Cyberpunk Cityscape",
    "prompt": "cyberpunk cityscape {prompt} . neon lights, dark alleys, skyscrapers, futuristic, vibrant colors, high contrast, highly detailed",
    "negative_prompt": "natural, rural, deformed, low contrast, black and white, sketch, watercolor",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Futuristic Futuristic",
    "prompt": "futuristic style {prompt} . sleek, modern, ultramodern, high tech, detailed",
    "negative_prompt": "ugly, deformed, noisy, blurry, low contrast, realism, photorealistic, vintage, antique",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Futuristic Retro Cyberpunk",
    "prompt": "retro cyberpunk {prompt} . 80’s inspired, synthwave, neon, vibrant, detailed, retro futurism",
    "negative_prompt": "modern, desaturated, black and white, realism, low contrast",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Futuristic Retro Futurism",
    "prompt": "retro-futuristic {prompt} . vintage sci-fi, 50s and 60s style, atomic age, vibrant, highly detailed",
    "negative_prompt": "contemporary, realistic, rustic, primitive",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Futuristic Sci Fi",
    "prompt": "sci-fi style {prompt} . futuristic, technological, alien worlds, space themes, advanced civilizations",
    "negative_prompt": "ugly, deformed, noisy, blurry, low contrast, realism, photorealistic, historical, medieval",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Futuristic Vaporwave",
    "prompt": "vaporwave style {prompt} . retro aesthetic, cyberpunk, vibrant, neon colors, vintage 80s and 90s style, highly detailed",
    "negative_prompt": "monochrome, muted colors, realism, rustic, minimalist, dark",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Game Bubble Bobble",
    "prompt": "Bubble Bobble style {prompt} . 8-bit, cute, pixelated, fantasy, vibrant, reminiscent of Bubble Bobble game",
    "negative_prompt": "realistic, modern, photorealistic, violent, horror",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Game Cyberpunk Game",
    "prompt": "cyberpunk game style {prompt} . neon, dystopian, futuristic, digital, vibrant, detailed, high contrast, reminiscent of cyberpunk genre video games",
    "negative_prompt": "historical, natural, rustic, low detailed",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Game Fighting Game",
    "prompt": "fighting game style {prompt} . dynamic, vibrant, action-packed, detailed character design, reminiscent of fighting video games",
    "negative_prompt": "peaceful, calm, minimalist, photorealistic",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Game Gta",
    "prompt": "GTA-style artwork {prompt} . satirical, exaggerated, pop art style, vibrant colors, iconic characters, action-packed",
    "negative_prompt": "realistic, black and white, low contrast, impressionist, cubist, noisy, blurry, deformed",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Game Mario",
    "prompt": "Super Mario style {prompt} . vibrant, cute, cartoony, fantasy, playful, reminiscent of Super Mario series",
    "negative_prompt": "realistic, modern, horror, dystopian, violent",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Game Minecraft",
    "prompt": "Minecraft style {prompt} . blocky, pixelated, vibrant colors, recognizable characters and objects, game assets",
    "negative_prompt": "smooth, realistic, detailed, photorealistic, noise, blurry, deformed",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Game Pokemon",
    "prompt": "Pokémon style {prompt} . vibrant, cute, anime, fantasy, reminiscent of Pokémon series",
    "negative_prompt": "realistic, modern, horror, dystopian, violent",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Game Retro Arcade",
    "prompt": "retro arcade style {prompt} . 8-bit, pixelated, vibrant, classic video game, old school gaming, reminiscent of 80s and 90s arcade games",
    "negative_prompt": "modern, ultra-high resolution, photorealistic, 3D",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Game Retro Game",
    "prompt": "retro game art {prompt} . 16-bit, vibrant colors, pixelated, nostalgic, charming, fun",
    "negative_prompt": "realistic, photorealistic, 35mm film, deformed, glitch, low contrast, noisy",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Game RPG Fantasy Game",
    "prompt": "role-playing game (RPG) style fantasy {prompt} . detailed, vibrant, immersive, reminiscent of high fantasy RPG games",
    "negative_prompt": "sci-fi, modern, urban, futuristic, low detailed",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Game Strategy Game",
    "prompt": "strategy game style {prompt} . overhead view, detailed map, units, reminiscent of real-time strategy video games",
    "negative_prompt": "first-person view, modern, photorealistic",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Game Streetfighter",
    "prompt": "Street Fighter style {prompt} . vibrant, dynamic, arcade, 2D fighting game, highly detailed, reminiscent of Street Fighter series",
    "negative_prompt": "3D, realistic, modern, photorealistic, turn-based strategy",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Game Zelda",
    "prompt": "Legend of Zelda style {prompt} . vibrant, fantasy, detailed, epic, heroic, reminiscent of The Legend of Zelda series",
    "negative_prompt": "sci-fi, modern, realistic, horror",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Misc Architectural",
    "prompt": "architectural style {prompt} . clean lines, geometric shapes, minimalist, modern, architectural drawing, highly detailed",
    "negative_prompt": "curved lines, ornate, baroque, abstract, grunge",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Misc Disco",
    "prompt": "disco-themed {prompt} . vibrant, groovy, retro 70s style, shiny disco balls, neon lights, dance floor, highly detailed",
    "negative_prompt": "minimalist, rustic, monochrome, contemporary, simplistic",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Misc Dreamscape",
    "prompt": "dreamscape {prompt} . surreal, ethereal, dreamy, mysterious, fantasy, highly detailed",
    "negative_prompt": "realistic, concrete, ordinary, mundane",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Misc Dystopian",
    "prompt": "dystopian style {prompt} . bleak, post-apocalyptic, somber, dramatic, highly detailed",
    "negative_prompt": "ugly, deformed, noisy, blurry, low contrast, cheerful, optimistic, vibrant, colorful",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Misc Fairy Tale",
    "prompt": "fairy tale {prompt} . magical, fantastical, enchanting, storybook style, highly detailed",
    "negative_prompt": "realistic, modern, ordinary, mundane",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Misc Gothic",
    "prompt": "gothic style {prompt} . dark, mysterious, haunting, dramatic, ornate, detailed",
    "negative_prompt": "ugly, deformed, noisy, blurry, low contrast, realism, photorealistic, cheerful, optimistic",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Misc Grunge",
    "prompt": "grunge style {prompt} . textured, distressed, vintage, edgy, punk rock vibe, dirty, noisy",
    "negative_prompt": "smooth, clean, minimalist, sleek, modern, photorealistic",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Misc Horror",
    "prompt": "horror-themed {prompt} . eerie, unsettling, dark, spooky, suspenseful, grim, highly detailed",
    "negative_prompt": "cheerful, bright, vibrant, light-hearted, cute",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Misc Kawaii",
    "prompt": "kawaii style {prompt} . cute, adorable, brightly colored, cheerful, anime influence, highly detailed",
    "negative_prompt": "dark, scary, realistic, monochrome, abstract",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Misc Lovecraftian",
    "prompt": "lovecraftian horror {prompt} . eldritch, cosmic horror, unknown, mysterious, surreal, highly detailed",
    "negative_prompt": "light-hearted, mundane, familiar, simplistic, realistic",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Misc Macabre",
    "prompt": "macabre style {prompt} . dark, gothic, grim, haunting, highly detailed",
    "negative_prompt": "bright, cheerful, light-hearted, cartoonish, cute",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Misc Manga",
    "prompt": "manga style {prompt} . vibrant, high-energy, detailed, iconic, Japanese comic style",
    "negative_prompt": "ugly, deformed, noisy, blurry, low contrast, realism, photorealistic, Western comic style",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Misc Metropolis",
    "prompt": "metropolis-themed {prompt} . urban, cityscape, skyscrapers, modern, futuristic, highly detailed",
    "negative_prompt": "rural, natural, rustic, historical, simple",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Misc Minimalist",
    "prompt": "minimalist style {prompt} . simple, clean, uncluttered, modern, elegant",
    "negative_prompt": "ornate, complicated, highly detailed, cluttered, disordered, messy, noisy",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Misc Monochrome",
    "prompt": "monochrome {prompt} . black and white, contrast, tone, texture, detailed",
    "negative_prompt": "colorful, vibrant, noisy, blurry, deformed",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Misc Nautical",
    "prompt": "nautical-themed {prompt} . sea, ocean, ships, maritime, beach, marine life, highly detailed",
    "negative_prompt": "landlocked, desert, mountains, urban, rustic",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Misc Space",
    "prompt": "space-themed {prompt} . cosmic, celestial, stars, galaxies, nebulas, planets, science fiction, highly detailed",
    "negative_prompt": "earthly, mundane, ground-based, realism",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Misc Stained Glass",
    "prompt": "stained glass style {prompt} . vibrant, beautiful, translucent, intricate, detailed",
    "negative_prompt": "ugly, deformed, noisy, blurry, low contrast, realism, photorealistic",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Misc Techwear Fashion",
    "prompt": "techwear fashion {prompt} . futuristic, cyberpunk, urban, tactical, sleek, dark, highly detailed",
    "negative_prompt": "vintage, rural, colorful, low contrast, realism, sketch, watercolor",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Misc Tribal",
    "prompt": "tribal style {prompt} . indigenous, ethnic, traditional patterns, bold, natural colors, highly detailed",
    "negative_prompt": "modern, futuristic, minimalist, pastel",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Misc Zentangle",
    "prompt": "zentangle {prompt} . intricate, abstract, monochrome, patterns, meditative, highly detailed",
    "negative_prompt": "colorful, representative, simplistic, large fields of color",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Papercraft Collage",
    "prompt": "collage style {prompt} . mixed media, layered, textural, detailed, artistic",
    "negative_prompt": "ugly, deformed, noisy, blurry, low contrast, realism, photorealistic",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Papercraft Flat Papercut",
    "prompt": "flat papercut style {prompt} . silhouette, clean cuts, paper, sharp edges, minimalist, color block",
    "negative_prompt": "3D, high detail, noise, grainy, blurry, painting, drawing, photo, disfigured",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Papercraft Kirigami",
    "prompt": "kirigami representation of {prompt} . 3D, paper folding, paper cutting, Japanese, intricate, symmetrical, precision, clean lines",
    "negative_prompt": "painting, drawing, 2D, noisy, blurry, deformed",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Papercraft Paper Mache",
    "prompt": "paper mache representation of {prompt} . 3D, sculptural, textured, handmade, vibrant, fun",
    "negative_prompt": "2D, flat, photo, sketch, digital art, deformed, noisy, blurry",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Papercraft Paper Quilling",
    "prompt": "paper quilling art of {prompt} . intricate, delicate, curling, rolling, shaping, coiling, loops, 3D, dimensional, ornamental",
    "negative_prompt": "photo, painting, drawing, 2D, flat, deformed, noisy, blurry",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Papercraft Papercut Collage",
    "prompt": "papercut collage of {prompt} . mixed media, textured paper, overlapping, asymmetrical, abstract, vibrant",
    "negative_prompt": "photo, 3D, realistic, drawing, painting, high detail, disfigured",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Papercraft Papercut Shadow Box",
    "prompt": "3D papercut shadow box of {prompt} . layered, dimensional, depth, silhouette, shadow, papercut, handmade, high contrast",
    "negative_prompt": "painting, drawing, photo, 2D, flat, high detail, blurry, noisy, disfigured",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Papercraft Stacked Papercut",
    "prompt": "stacked papercut art of {prompt} . 3D, layered, dimensional, depth, precision cut, stacked layers, papercut, high contrast",
    "negative_prompt": "2D, flat, noisy, blurry, painting, drawing, photo, deformed",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Papercraft Thick Layered Papercut",
    "prompt": "thick layered papercut art of {prompt} . deep 3D, volumetric, dimensional, depth, thick paper, high stack, heavy texture, tangible layers",
    "negative_prompt": "2D, flat, thin paper, low stack, smooth texture, painting, drawing, photo, deformed",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Photo Alien",
    "prompt": "alien-themed {prompt} . extraterrestrial, cosmic, otherworldly, mysterious, sci-fi, highly detailed",
    "negative_prompt": "earthly, mundane, common, realistic, simple",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Photo Film Noir",
    "prompt": "film noir style {prompt} . monochrome, high contrast, dramatic shadows, 1940s style, mysterious, cinematic",
    "negative_prompt": "ugly, deformed, noisy, blurry, low contrast, realism, photorealistic, vibrant, colorful",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Photo Glamour",
    "prompt": "glamorous photo {prompt} . high fashion, luxurious, extravagant, stylish, sensual, opulent, elegance, stunning beauty, professional, high contrast, detailed",
    "negative_prompt": "ugly, deformed, noisy, blurry, distorted, grainy, sketch, low contrast, dull, plain, modest",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Photo Hdr",
    "prompt": "HDR photo of {prompt} . High dynamic range, vivid, rich details, clear shadows and highlights, realistic, intense, enhanced contrast, highly detailed",
    "negative_prompt": "flat, low contrast, oversaturated, underexposed, overexposed, blurred, noisy",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Photo Iphone Photographic",
    "prompt": "iphone photo {prompt} . large depth of field, deep depth of field, highly detailed",
    "negative_prompt": "drawing, painting, crayon, sketch, graphite, impressionist, noisy, blurry, soft, deformed, ugly, shallow depth of field, bokeh",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Photo Long Exposure",
    "prompt": "long exposure photo of {prompt} . Blurred motion, streaks of light, surreal, dreamy, ghosting effect, highly detailed",
    "negative_prompt": "static, noisy, deformed, shaky, abrupt, flat, low contrast",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Photo Neon Noir",
    "prompt": "neon noir {prompt} . cyberpunk, dark, rainy streets, neon signs, high contrast, low light, vibrant, highly detailed",
    "negative_prompt": "bright, sunny, daytime, low contrast, black and white, sketch, watercolor",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Photo Silhouette",
    "prompt": "silhouette style {prompt} . high contrast, minimalistic, black and white, stark, dramatic",
    "negative_prompt": "ugly, deformed, noisy, blurry, low contrast, color, realism, photorealistic",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
  {
    "name": "Photo Tilt Shift",
    "prompt": "tilt-shift photo of {prompt} . selective focus, miniature effect, blurred background, highly detailed, vibrant, perspective control",
    "negative_prompt": "blurry, noisy, deformed, flat, low contrast, unrealistic, oversaturated, underexposed",
    "image": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  },
]