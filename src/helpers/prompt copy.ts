import { contentTypes, purposes } from "@/components/NewHeadlinesModal/options";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";

const context = `Mealful is a mobile app for people who wants to lose weight without restricting themselves or counting their calories.
We don't support the idea of counting calories or restrictive ways/diets of losing weight will works in the long term, but instead supports the idea of mindful eating, eating high-density foods, choosing the right foods, reduce bad sugar, knowing healthy alternatives to certain foods, changing the relationship you have with foods for the better, behavior change and growth mindset techniques (CBT) on yourself.
We are not nutritionists not experts at Mealful.

Important instructions:
You are writer for Mealful, expert in storytelling.
You don’t make up statistics or facts.
You leverage featured snippets (lists, tables, paragraph) when necessary to improve ranking.
Your tone is conversational not casual.
You use the third person (he,she,it,they) and/or second person (you,your,yours) perspective.
No success stories.
`;

// Your output is in Markdown syntax (h1 = #, h2 = ##, h3 = ###, **bold**, _italic_, etc.).

const headline = (keyword: string) => {
  return `${context}

  Write a clickbait headline based on the keyword: ${keyword}.

  Don't add date.
  Avoid words like "Expert, World, Authorities, etc..."
  Don't prefix the headline.
  max 10 words.
  `
}

const clusterHeadline = (data) => {
  return `Headline writer

  Project: ${data.project_name}
  Description: ${data.projecct_description || "not defined."}
  Target Audience: ${data.project_target_audience || 'not defined.'}
  Topic cluster: ${data.topic_cluster_name}
  Headlines in the cluster: ${data?.existing_headlines?.length > 0 ? data.existing_headlines.map(i => `${i.title} (${i.content_type})`).join("|") : "none"}
  Content types: ${data.content_types.map((i) => i.label).join(',')} (random)
  Accepted content types: ${contentTypes.filter(i => i.enabled).map(i => i.label).join(',')}
  Accepted purposes: ${purposes.filter(i => i.enabled).map(i => i.label).join(',')}
  Clickbait: no
  Hook: no
  Search intent: yes
  Logical order: yes (each headline is the continuation of the previous one)
  Headline length: < 10 words
  Output (JSON array): [{title: "", content_type: "", purpose: "", recommended_word_count: 0 }]
  Number of headlines: ${data.headline_count}
  recommended_word_count: number of words to rank in the serp between 500 and 3000
  Other indications: not numbered headline, no dashes or special characters, don't overmention the topic.
  `
}

const tableOfContent = (blogTitle: string) => {
  return `${context}

  Table of content (use the below structure):
  keyword in title definition (optional)
  introduction
  sections/topics (between 4 and 6)
  conclusion

  Sections have less than 7 words.
  No sub-sections.
  Don't include "Table of Content"

  Write a simple and unformatted table of content with one section by line: ${blogTitle}.
  `
}

const topicDefinition = (blogTitle: string, tableOfContent: string) => {
  return `${context}

  Table of content:
  ${tableOfContent}

  Write a definition introduction of the blog post: ${blogTitle}.
  `
}

const introduction = (blogTitle: string, tableOfContent: string) => {
  return `${context}

  Title:
  ${blogTitle}

  Table of content:
  ${tableOfContent}

  Write an introduction and an optional definition if needed for SEO ranking (featured snippet) of maximum 200 words for this article.
  `
}

const section = ({
  blogTitle,
  tableOfContent,
  topic,
  previousSection,
}: {
  blogTitle: string,
  tableOfContent: string,
  topic: string,
  previousSection: string,
}) => {
  return `${context}

  Title:
  ${blogTitle}

  Table of content:
  ${tableOfContent}

  Words to avoid:
  - Remember

  ${previousSection ? 'previous section\n' + previousSection + '\n\n' : ''}

  Write the content of ${topic} with between 300 and 600 words depending on the section.
  Don't include ${topic} in the content.

  Add sub-sections (optional, prefixed with ###)
  `
}

const sectionsSummary = (sections: string) => {
  return `${sections}

  Summarise the following content while keeping the same tones and important information.
  `
}

const articleSummary = ({
  blogTitle,
  tableOfContent,
  previousSectionsSummary,
  topic
}: {
  blogTitle: string, tableOfContent: string, previousSectionsSummary: string, topic: string
}) => {
  return `${context}

  As a SEO expert you leverage featured snippets (lists, tables, paragraph) when necessary to improve ranking.

  Title:
  ${blogTitle}

  Table of content:
  ${tableOfContent}

  Previous sections summary:
  ${previousSectionsSummary}

  Write summary or conclusion of between 50 and 200 words to finish/conclude the article.
  `
}

const seoMetaTags = ({
  blogTitle,
  tableOfContent,
  previousSectionsSummary,
  topic
}: {
  blogTitle: string, tableOfContent: string, previousSectionsSummary: string, topic: string
}) => {
  return `${context}

  As a SEO expert you leverage featured snippets (lists, tables, paragraph) when necessary to improve ranking.

  Title:
  ${blogTitle}

  Table of content:
  ${tableOfContent}

  Previous sections summary:
  ${previousSectionsSummary}

  Write meta tags for SEO (title, description, og:title, og:description, and others if necessary).
  `
}

const schemaMarkup = (blogTitle: string, tableOfContent: string) => {
  return `Schema markup list:
  Article
  Breadcrumb
  How-to
  Person
  Product
  Recipe
  Video
  Website
  RestrictedDiet

  Title:
  ${blogTitle}

  Table of content:
  ${tableOfContent}

  Write the schema markups that are suitable for this article.
  `
}

const seoOptmiser = (content: string) => {
  return `${content}

  format the content
  remove undesired characters
  add html tags
  correct any grammar or orthograph issues
  make it easy to read if it's not
  reduce repetition, keyword stuffing
  correct uncaught errors
  make it more original
  optimize it for SEO (SEO-friendly) with html tags and attributes
  `
}

const feedback = (content: string) => {
  return `${content}

  ===

  As a SEO and storyteller expert give practical ways to improve this blog post? (one improvement per line).
  Make it more readable, less repetitive, reduce redundant words, rephrase ideas.
  `
}

const rephrase = (content: string) => {
  return `${content}

  ===

  Improve the above text by rephrasing/replacing parts that are redudant, repetitive, hard to read, avoid words similar to "remember, stay tuned", reduce or find alternative ways to words like "focus/focusing".
  Do not conclude or sum up at the end nor introduce the next section.
  Only conlude if the entire section is meant to be a conclusion.
  `
}

// const rephrase = (content: string, previousSection: string) => {
//   return `
// ${previousSection ? 'Previous section:\n' + previousSection + '\n\n' : ''}

//   Section:
//   ${content}

//   ===

//   Rephrase if keyword appears twice or more.
//   Do not conclude or sum up at the end nor introduce the next section.
//   Only conlude if the entire section is meant to be a conclusion.
//   `
// }

const improve = (content: string, feedback: string) => {
  return `${content}

  ===

  Improve the blog post following most of the feedbacks listed below.

  ${feedback}
  `
}

// const formatTOC = (toc: string) => {
//   return `Format the table of content.

//   Example with dummy text:
//   <div id="table-of-content">
//     <p>Table of contents</p>
//     <p class="section-name"><a href="#section-name">1. Section name<a/></p>
//     <ul>
//       <li><a href="#why-table-of-content">1.1 sub-section name</a></li>
//       <li><a href="#...">1.2 sub-section name</a></li>
//     </ul>
//     <p class="section-name"><a href="#section-name">2. Section name<a/></p>
//     <ul>
//       <li><a href="#...">2.1 sub-section name</a></li>
//       <li><a href="#...">2.2 sub-section name</a></li>
//     </ul>
//   </div>

//   replace classes, hrefs, anchor links, section/sub-section name and text with real values.
//   don't prefix the sections.
//   number section as follow 1, 1.1, 1.2, 2, 2.1, etc..

//   ${toc}
//   `
// }

const prompt = {
  headline,
  tableOfContent,
  topicDefinition,
  introduction,
  section,
  sectionsSummary,
  articleSummary,
  seoMetaTags,
  schemaMarkup,
  seoOptmiser,
  feedback,
  improve,
  rephrase,
  clusterHeadline
  // formatTOC
}

export default prompt