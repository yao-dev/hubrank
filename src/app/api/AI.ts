import Anthropic from "@anthropic-ai/sdk";
import yaml from 'js-yaml';
import { getSummary } from 'readability-cyr';
import { normalizePrompt } from "./helpers";
// import { countTokens } from '@anthropic-ai/tokenizer';
import chalk from 'chalk';
import { format } from "date-fns";
import OpenAI from "openai";
import { emotions, perspectives, purposes, sentenceStructures, tones, vocabularies } from "@/options";
import { capitalize, isEmpty } from "lodash";

export type CaptionTemplate = {
  platform: string;
  goal: "write" | "rephrase" | "reply" | "youtube_to_caption";
  caption_length: number;
  description: string;
  tones?: string[];
  purposes?: string[];
  emotions?: string[];
  vocabularies?: string[];
  sentence_structures?: string[];
  perspectives?: string[];
  writing_structures?: string[];
  instructional_elements?: string[];
  with_hashtags?: boolean;
  with_emojis?: boolean;
  with_single_emoji?: boolean;
  with_question?: boolean;
  with_hook?: boolean;
  with_cta?: boolean;
  cta?: string;
  caption_source?: string;
  language: string;
  writingStyle?: string;
  external_sources?: {
    url: string;
    objective: string
  };
  youtube_transcript?: string
}

const costs = {
  "claude-3-opus-20240229": {
    input: 15,
    output: 75,
    calculation_based_on_token_count: 1000000,
  },
  "claude-3-sonnet-20240229": {
    input: 3,
    output: 15,
    calculation_based_on_token_count: 1000000,
  },
  "claude-3-haiku-20240307": {
    input: 3,
    output: 15,
    calculation_based_on_token_count: 1000000,
  },
  "claude-2.1": {
    input: 8,
    output: 24,
    calculation_based_on_token_count: 1000000,
  },
  "claude-2.0": {
    input: 8,
    output: 24,
    calculation_based_on_token_count: 1000000,
  },
  "claude-instant-1.2": {
    input: 0.80,
    output: 2.4,
    calculation_based_on_token_count: 1000000,
  },
  "gpt-4o": {
    input: 5,
    output: 15,
    calculation_based_on_token_count: 1000000,
  },
  "gpt-4-0613": {
    input: 0.80, // not real data
    output: 2.4, // not real data
    calculation_based_on_token_count: 1000000,
  },
}

const models = {
  opus: "claude-3-opus-20240229",
  sonnet: "claude-3-sonnet-20240229",
  haiku: "claude-3-haiku-20240307",
  "gpt-4o": "gpt-4o",
  "gpt-4-0613": "gpt-4-0613"
}

type TokenCountArgs = {
  text: string,
  model: "claude-3-opus-20240229" | "claude-3-sonnet-20240229" | "claude-2.1" | "claude-2.0" | "claude-instant-1.2" | "claude-3-haiku-20240307" | "gpt-4o" | "gpt-4-0613",
  mode: "input" | "output"
}

type Opts = {
  context?: string,
  writing_style?: any
}

export class AI {
  ai_mode = "openai"
  messages: any = [];
  system = "";
  article = "";
  ai: any;
  cost: number = 0;
  opts: Opts;

  constructor(opts: Opts = {}) {
    this.opts = opts
    if (this.ai_mode === "anthropic") {
      this.ai = new Anthropic({
        baseURL: "https://anthropic.hconeai.com/",
        apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY, // defaults to process.env["ANTHROPIC_API_KEY"]
        defaultHeaders: {
          "Helicone-Auth": `Bearer ${process.env.NEXT_PUBLIC_HELICONE_AUTH}`,
        },
      });
    } else {
      this.ai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        baseURL: "https://oai.hconeai.com/v1",
        defaultHeaders: {
          "Helicone-Auth": `Bearer ${process.env.NEXT_PUBLIC_HELICONE_AUTH}`,
        },
      });
    }
    this.system = `You are an expert SEO writer who writes using Hemingway principles (grade 10) and writes engaging and punchy content that speak to the right target audience.`

    if (opts.context) this.system += `\nProduct info:\n${opts.context}\n===`
    if (opts.writing_style) {
      this.system += `\nWriting style example to imitate:\n${opts.writing_style}`
      // this.system += opts.writing_style?.purposes?.length > 0 ? `\nPurposes: ${opts.writing_style?.purposes.join(', ')}` : "";
      // this.system += opts.writing_style?.emotions?.length > 0 ? `\nEmotions: ${opts.writing_style?.emotions.join(', ')}` : "";
      // this.system += opts.writing_style?.vocabularies?.length > 0 ? `\nVocabularies: ${opts.writing_style?.vocabularies.join(', ')}` : "";
      // this.system += opts.writing_style?.sentence_structures?.length > 0 ? `\nSentence structures: ${opts.writing_style?.sentence_structures.join(', ')}` : "";
      // this.system += opts.writing_style?.perspectives?.length > 0 ? `\nPerspectives: ${opts.writing_style?.perspectives.join(', ')}` : "";
      // this.system += opts.writing_style?.writing_structures?.length > 0 ? `\nWriting structures: ${opts.writing_style?.writing_structures.join(', ')}` : "";
      // this.system += opts.writing_style?.instructional_elements?.length > 0 ? `\nInstructional elements: ${opts.writing_style?.instructional_elements.join(', ')}` : "";
    }

    // [IMPORTANT] use the first personal of plural (we,us,our, etc..) when referring to our product/project
    // ${opts.writing_style ? `Writing style to copy:\n${opts.writing_style}` : ""}
    // ${opts.writing_style ? `[IMPORTANT] Writing style instruction: Impersonate the personality and tone of the provided example` : ""}
    // [IMPORTANT] balance short and long sentences with varying structures and complexity levels, which contributes to high burstiness in your content.

    this.system = this.system.trim()
      .replaceAll("\n\n\n\n", "\n")
      .replaceAll("\n\n\n", "\n")

    console.log(chalk.blueBright("[AI]: system"), this.system)
  }

  resetPrompt() {
    console.log(chalk.blueBright("[AI]: reset prompt"))
    this.messages = [];
  }

  getExtractionRegex(type: string) {
    switch (type) {
      case "json":
        return /```json([\s\S]+?)```/i;
      case "yaml":
        return /```yaml([\s\S]+?)```/i;
      case "yml":
        return /```yml([\s\S]+?)```/i;
      case "markdown":
        return /```markdown([\s\S]+?)```/i;
      case "text":
        return /```text([\s\S]+?)```/i;
      default:
        return
    }
  }

  extractText(text: string, type: string) {
    if (text.indexOf("@@@") !== -1) {
      return text.slice(text.indexOf("@@@") + 3, text.lastIndexOf("@@@"));
    }

    // const regex: any = this.getExtractionRegex(type);
    // const match = text.match(regex);

    // if (match && match.length >= 2) {
    //   return match[1].trim();
    // }

    const markup = "```" + type;
    const jsonString = text.slice(text.indexOf(markup) + markup.length, text.lastIndexOf("```"))
    // .replaceAll("\n", "")

    return jsonString;
  }

  parse(text: string, contentType: string = "") {
    if (text.indexOf("@@@") !== -1) {
      return text.slice(text.indexOf("@@@") + 3, text.lastIndexOf("@@@"));
    }

    const content = this.extractText(text, contentType);
    // content = text.slice(text.indexOf(marker) + marker.length, text.lastIndexOf("```"));

    if (contentType === "json") {
      return JSON.parse(content)
    }
    if (contentType === "yml" || contentType === "yaml") {
      return yaml.load(content)
    }

    // let content = text;
    // const marker = "```" + contentType;

    // if (["json", "yml", "yaml"].includes(contentType)) {
    //   content = this.extractText(text, contentType) || content;
    //   // content = text.slice(text.indexOf(marker) + marker.length, text.lastIndexOf("```"));

    //   if (contentType === "json") {
    //     return JSON.parse(content)
    //   }
    //   if (contentType === "yml" || contentType === "yaml") {
    //     return yaml.load(content)
    //   }
    // }

    return content;
  }

  addArticleContent(content: any) {
    this.article += `\n${content.replaceAll(".", ".\n")}\n`;
    console.log(chalk.cyanBright(this.article))
  }

  // addTokenCost({ text, model, mode }: TokenCountArgs) {
  //   const modelCost = costs[model][mode];
  //   const tokens = countTokens(text);
  //   const modelCostPerToken = (modelCost / costs[model].calculation_based_on_token_count)
  //   const totalCost = tokens * modelCostPerToken;

  //   this.cost += totalCost;
  //   console.log(chalk.blueBright(`[AI]: tokens: ${tokens} | cost: ${totalCost}`));
  // }

  async ask(prompt: any, opts: any = {}) {
    prompt = normalizePrompt(prompt);
    console.log(chalk.blueBright(`[AI]: ${opts.mode || "ask"}`));
    console.log(chalk.yellow(`[AI]: prompt\n${prompt}`));

    const start = performance.now();

    // this.addTokenCost({ text: `${this.system} ${prompt}`, model: opts.model, mode: "input" });

    let completion;

    if (this.ai_mode === "anthropic") {
      completion = await this.ai.beta.messages.create({
        // model: opts.model || "claude-3-sonnet-20240229",
        model: models["gpt-4o"],
        max_tokens: opts.word_count ? Math.min(opts.word_count * 3, 4096) : 4096,
        temperature: opts.temperature || 0.7,
        system: this.system,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        // top_k: 0,
        // metadata: {user_id: ""}
      });
    } else {
      completion = await this.ai.chat.completions.create({
        // model: opts.model || "claude-3-sonnet-20240229",
        model: models["gpt-4o"],
        max_tokens: opts.word_count ? Math.min(opts.word_count * 3, 4096) : 4096,
        temperature: opts.temperature || 0.7,
        messages: [
          {
            role: "system",
            content: this.system
          },
          {
            role: "user",
            content: prompt
          }
        ],
        // top_k: 0,
        // metadata: {user_id: ""}
      });
    }

    // this.addTokenCost({ text: completion.content[0].text, model: opts.model, mode: "output" });

    const end = performance.now();
    console.log(chalk.blueBright(`[AI]: duration: ${(end - start) / 1000}`));

    const text = this.ai_mode === "anthropic" ? completion.content[0].text : completion.choices[0].message.content

    console.log("result before parse", chalk.blueBright(text));
    const result = this.parse(text, opts.type)
    console.log("result after parse", chalk.magentaBright(JSON.stringify(result, null, 2)));
    return result
  }

  headlinesTemplate(values: any) {
    // Write the headlines wrapped within triple @@@.

    const prefix = values.isInspo ? `headline inspo: ${values.inspo_title}` : `List of competitors headline ranking in the 1st page of the SERP for the keyword "${values.seedKeyword}":
- ${values.competitorsHeadlines.join('\n- ')}`

    let prompt = `${prefix}

    Give me ${values.count} unique and SEO friendly ${values.count <= 1 ? "headline" : "headlines"} made for the search intent "${values.seedKeyword}"
    - your tone is ${values.tone}
    - your purpose is ${values.purpose}
    - the content type is "${values.contentType}"
    ${values.clickbait ? "- make it clickbait" : ""}
    - one headline per line
    - do not prefix with number`;

    if (values.writingStyle) prompt += `\nCopy the tone and writing style of this text: ${values.writingStyle}`;

    prompt += `\nStart and end your writing with triple @@@.`

    return prompt
  }

  async headlines(values: any) {
    return this.ask(this.headlinesTemplate(values), { mode: "headlines", temperature: 0.5, model: models.opus });
  }

  titleTemplate({ competitorsHeadlines, seedKeyword, tone, contentType, purpose, clickbait }: any) {
    return `List of competitors headline ranking in the 1st page of the SERP for the keyword "${seedKeyword}"
- ${competitorsHeadlines.join('\n- ')}

    Write a unique and SEO friendly headline made for the search intent "${seedKeyword}"
    - your tone is ${tone}
    - your purpose is ${purpose}
    - the content type is "${contentType}"
    ${clickbait ? "- the headline is a clickbait" : ""}
    - write in markdown wrapped in \`\`\`markdown\`\`\`
    `
  }

  async title(values: any) {
    return this.ask(this.titleTemplate(values), { type: "markdown", mode: "title", temperature: 0.5, model: models.opus });
  }

  // outlineIdeaTemplate(values: any) {
  //   // - the outline must have ${values.heading_count} sections
  //   return `Write an outline for: "${values.title}"
  //   - ${values.content_type ? `the content type is: ${values.content_type}` : ""}
  //   - ${values.purpose ? `the purpose is: ${values.purpose}` : ""}
  //   - ${values.introduction ? "add an introduction" : "do not add an introduction"}
  //   - ${values.conclusion ? "add a conclusion/summary" : "do not add a conclusion"}
  //   - ${values.key_takeways ? "add a key takeways" : "do not add a key takeways"}
  //   - ${values.faq ? "add a FAQ" : "do not add a FAQ"}
  //   - list of keywords to choose from to include in the section titles: ${values.keywords.join(',')}
  //   - language: ${values.language}

  //   Wrap the outline in a well formated JSON array wrapped in \`\`\`json\`\`\` follow the structure shown below
  //   \`\`\`json
  //   [
  //     "section name 1",
  //     "section name 2",
  //     "section name 3",
  //   ]
  //   \`\`\`
  //   `
  // }

  // async outlines(values: any) {
  //   return this.ask(this.outlineIdeaTemplate(values), { type: "json", mode: "outlines", temperature: 0.7, model: models.sonnet });
  // }

  //   outlineTemplate(values: any) {
  //     // - number of heading: ${values.heading_count}
  //     let prompt = `Write an article outline for the headline: "${values.title}"
  // - the content type is ${values.content_type}
  // - select the right amount of words 500,750,1000,1500 or 2000 words for this article based on its headline and content type
  // - add the word count for each section and sub-section
  // - a section might have text before its sub-sections
  // - a section that has more than 200 words should be split into sub-sections
  // - a sub-section is optional
  // - a sub-section has no more than 200 words`;

  //     prompt += values.introduction ? "\nadd an introduction, it is no more than 100 words (it never has sub-sections)" : "\ndo not add an introduction"
  //     prompt += values.conclusion ? "\nadd a conclusion/summary, it is no more than 200 words (it never has sub-sections)" : "\ndo not add a conclusion"
  //     prompt += values.key_takeways ? "\nadd a key takeways, it is a list of key points or short paragraph (it never has sub-sections)" : "\ndo not add a key takeways"
  //     prompt += values.faq ? "\nadd a FAQ" : "\ndo not add a FAQ";

  //     prompt += `\n- list of keywords to choose from to include in the section titles: ${values.keywords}
  // - make sure the sum of all sections (sub-sections not included) equals to the selected words count
  // - Language: ${values.language}

  // Addition information: ${values.additional_information}

  // Write the outline following the structure below

  // type Outline = {
  //   total_word_count: number;
  //   sections: {
  //     title: string;
  //     word_count: number;
  //     sub_sections?: {
  //       title: string;
  //       word_count: number;
  //     }[];
  //   }[];
  // }

  // Output a JSON array wrapped in \`\`\`json\`\`\`
  // `;
  //     return prompt
  //   }

  //   async outline(values: any) {
  //     return this.ask(this.outlineTemplate(values), { type: "json", mode: "outline", temperature: 0.7, model: models.opus });
  //   }

  hookTemplate(values: any) {
    let prompt = `
    Outline: ${values?.outline}
    Seed keyword: ${values?.seed_keyword}`;

    prompt += this.opts?.writing_style?.purposes?.length > 0 ? `\nPurposes: ${this.opts?.writing_style?.purposes.join(', ')}` : "";
    prompt += this.opts?.writing_style?.emotions?.length > 0 ? `\nEmotions: ${this.opts?.writing_style?.emotions.join(', ')}` : "";
    prompt += this.opts?.writing_style?.vocabularies?.length > 0 ? `\nVocabularies: ${this.opts?.writing_style?.vocabularies.join(', ')}` : "";
    // prompt += this.opts?.writing_style?.sentence_structures?.length > 0 ? `\nSentence structures: ${this.opts?.writing_style?.sentence_structures.join(', ')}` : "";
    prompt += this.opts?.writing_style?.perspectives?.length > 0 ? `\nPerspectives: ${this.opts?.writing_style?.perspectives.join(', ')}` : "";
    // prompt += this.opts?.writing_style?.writing_structures?.length > 0 ? `\nWriting structures: ${this.opts?.writing_style?.writing_structures.join(', ')}` : "";
    // prompt += this.opts?.writing_style?.instructional_elements?.length > 0 ? `\nInstructional elements: ${this.opts?.writing_style?.instructional_elements.join(', ')}` : "";

    // if (!isEmpty(values?.tones)) {
    //   prompt += `\nTones: ${JSON.stringify(values.tones, null, 2)}`
    // }

    if (!isEmpty(values?.keywords)) {
      prompt += `\nKeywords:\n${values.keywords.join('\n')}`
    }

    prompt += `
    Write a hook (typically ranging from one to three sentences or around 20-50 words) for the article "${values?.title}"
    Choose the hook type that fit the best this article
    write in markdown wrapped in \`\`\`markdown\`\`\`.
    `;

    return prompt;
  }

  async hook(values: any) {
    return this.ask(this.hookTemplate(values), { type: "markdown", mode: "hook", temperature: 0.3, model: models.opus })
  }

  writeTemplate(values: any) {
    const hasImages = values?.section?.images?.length > 0;
    const hasVideo = !!values?.section?.image_url;

    let prompt = `For the article "${values?.title}" write the section "${values?.section?.name}" with a maximum of ${values?.section?.word_count} words in markdown wrapped in \`\`\`markdown\`\`\`.
    Section heading prefix: ${values?.section?.prefix}
    Do not add a CTA at the end`

    // prompt += `Outline: ${values?.outline}`

    prompt += values?.section?.purposes?.length > 0 ? `\nPurposes: ${values?.section?.purposes.join(', ')}` : "";
    prompt += values?.section?.emotions?.length > 0 ? `\nEmotions: ${values?.section?.emotions.join(', ')}` : "";
    prompt += values?.section?.vocabularies?.length > 0 ? `\nVocabularies: ${values?.section?.vocabularies.join(', ')}` : "";
    prompt += values?.section?.sentence_structures?.length > 0 ? `\nSentence structures: ${values?.section?.sentence_structures.join(', ')}` : "";
    prompt += values?.section?.perspectives?.length > 0 ? `\nPerspectives: ${values?.section?.perspectives.join(', ')}` : "";
    prompt += values?.section?.writing_structures?.length > 0 ? `\nWriting structures: ${values?.section?.writing_structures.join(', ')}` : "";
    prompt += values?.section?.instructional_elements?.length > 0 ? `\nInstructional elements: ${values?.section?.instructional_elements.join(', ')}` : "";

    // if (!isEmpty(values?.tones)) {
    //   prompt += `\nTones: ${JSON.stringify(values.tones, null, 2)}`
    // }

    // if (values?.purpose) {
    //   prompt += `\nPurpose: ${values.purpose}`
    // }

    prompt += `\nRelevant keywords: ${values?.section?.keywords}`

    if (values?.section?.call_to_action) {
      prompt += `\nCall to action instructions:\n${values.section.call_to_action}`;
      if (values?.section?.call_to_action_example) {
        prompt += `\nCall to action instructions:\n${values.section.call_to_action}`
      }
    }

    if (values?.section?.internal_links?.length > 0) {
      prompt += `\nInternal links to include:\n${JSON.stringify(values.section.internal_links ?? [], null, 2)}`
    }
    if (values?.section?.internal_links?.length > 0) {
      prompt += `\nInternal links to include:\n${values.section.internal_links?.join('\n')}\n\n`
    }

    if (hasImages) {
      prompt += `\nImages to include: ${JSON.stringify(values?.section?.images ?? "", null, 2)}`
    }

    if (hasVideo) {
      prompt += `\nVideo to include:
      // here is how you embed it in the markdown => <p><iframe width="560" height="315" src="REPLACE_WITH_YOUTUBE_URL_HERE" title="" frameBorder="0"   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"  allowFullScreen></iframe></p>
      url: ${values.section.video_url}`
    }

    prompt += `
    Primary instructions:
    - Leverage markdown syntaxes to make your content appealing and easier to read.
    - Add h3 sub-sections with ### if the content as more than 2 paragraphs.
    - Don't use h1 at all.
    - You know how to transition from a section to another at the end of a section.
    - Add anchor to the section here is an example for a h2: ## <a name="heading-example"></a>Heading example
    - Prefer Active Voice
    - Avoid the use of adverbs as much as possible
    - IMPORTANT: Do not use adverbs at all
    - Simplify Words
    - Avoid Hard-to-Read Phrases
    - Avoid Passive Voice
    - Consider Sentence Variety
    - Readability Grade Goal 11
    - IMPORTANT: Diversify vocabulary
    - IMPORTANT: vary the sentence structure and tone to make it sound more conversational.
    - IMPORTANT: avoid words like "as you", "remember", "embrace", "by", "ready to", "are you tired", "are you struggling"
    - do not use emojis`

    if (values?.section?.image?.alt && values?.section?.image?.href) {
      prompt += `\n- Include this image in the content: ![${values.section.image.alt}](${values.section.image.href})`
    }

    if (values?.section?.custom_prompt) {
      prompt += `\nSecondary instructions (does not override primary instructions):\n${values?.section?.custom_prompt}`
    }

    //     prompt += `Article to expand:
    // ${this.article}
    //     `

    return prompt
  }

  async write(values: any) {
    return this.ask(this.writeTemplate(values), { type: "markdown", mode: "write", word_count: values.word_count, temperature: 0.5, model: models.opus });
  }

  expandTemplate() {
    return `Expand the text above by 50 to 150 words, write in markdown wrapped in \`\`\`markdown\`\`\`..`
  }

  async expand(section: any) {
    return this.ask(`
    "${section}"

    ${this.expandTemplate()}
  `, { type: "markdown", mode: "expand", temperature: 0 });
  }

  rephraseTemplate(content: any) {
    const stats = getSummary(content)
    return `There is ${stats.difficultWords} difficult words in this text and the Flesch Kincaid Grade is ${parseInt(stats.FleschKincaidGrade)}

    Please rephrase the above text applying Hemingway principles
    - Prefer Active Voice
    - Reword adverbs as much as possible
    - Avoid the use of adverbs
    - Remove all adverbs
    - Simplify Words
    - Check for Hard-to-Read Phrases
    - Avoid Passive Voice
    - Address Complex Sentences
    - Consider Sentence Variety
    - Readability Grade Goal 7
    - Remove Redundancy

    Keep all links and images if there are any.

    Write in markdown wrapped in \`\`\`markdown\`\`\`.`
  }

  async rephrase(section: any, additionalInstruction: string) {
    return this.ask(`
    "${section}"

    ===

    ${additionalInstruction}

    Keep all links and images if there are any.

    Write in markdown wrapped in \`\`\`markdown\`\`\`.
  `, { type: "markdown", mode: "rephrase", temperature: 0, model: models.haiku });
    //   return this.ask(`
    //   "${section}"

    //   ${this.rephraseTemplate(section)}
    // `, { type: "markdown", mode: "rephrase", temperature: 0.3, model: models.opus });
  }

  paraphraseTemplate(writingStyle = "") {
    return `Paraphrase the above text using the style of the following text:

    "${writingStyle}"

    Write in markdown wrapped in \`\`\`markdown\`\`\`.`
  }

  async paraphrase(section: any, writingStyle: any) {
    return this.ask(`
    "${section}"

    ${this.paraphraseTemplate(writingStyle)}
  `, { type: "markdown", mode: "paraphrase", temperature: 0.4 });
  }

  outlinePlanTemplate(values: any) {
    const hasImages = values?.images?.length > 0;
    const hasVideos = values?.videos?.length > 0;
    // - number of heading: ${values.heading_count}
    let prompt = `Write an article outline for the headline: "${values.title}"
- the content type is ${values.content_type}
- the article has no more than ${values.words_count} words length
- a section that has more than 200 words should be split into sub-sections or paragraphs`;

    if (values.youtube_transcript) {
      prompt += `\nWrite the article based on this youtube transcript: ${values.youtube_transcript.slice(0, 10000)}`
    }

    prompt += values.purposes?.length > 0 ? `\nPurposes: ${values.purposes.join(', ')}` : "";
    prompt += values.emotions?.length > 0 ? `\nEmotions: ${values.emotions.join(', ')}` : "";
    prompt += values.vocabularies?.length > 0 ? `\nVocabularies: ${values.vocabularies.join(', ')}` : "";
    prompt += values.sentence_structures?.length > 0 ? `\nSentence structures: ${values.sentence_structures.join(', ')}` : "";
    prompt += values.perspectives?.length > 0 ? `\nPerspectives: ${values.perspectives.join(', ')}` : "";
    prompt += values.writing_structures?.length > 0 ? `\nWriting structures: ${values.writing_structures.join(', ')}` : "";
    prompt += values.instructional_elements?.length > 0 ? `\nInstructional elements: ${values.instructional_elements.join(', ')}` : "";

    prompt += values.with_introduction ? "\n- add an introduction, it is no more than 100 words (it never has sub-sections)" : "\n- do not add an introduction"
    prompt += values.with_conclusion ? "\n- add a conclusion, it is no more than 200 words (it never has sub-sections)" : "\n- do not add a conclusion"
    prompt += values.with_key_takeways ? "\n- add a key takeways, it is a list of key points or short paragraph (it never has sub-sections)" : "\n- do not add a key takeways"
    prompt += values.with_faq ? "\n- add a FAQ" : "\n- do not add a FAQ";

    prompt += `\n- Language: ${values.language}`

    if (values.additional_information) {
      prompt += `\n-Additional information: ${values.additional_information}`
    }

    if (values.keywords?.length > 0) {
      prompt += `\n- Keywords (include relevant keywords only, avoid keywords stuffing):\n${values.keywords.join('\n')}\n\n`
    }

    if (values.sitemaps?.length > 0) {
      prompt += `\n- Sitemap (include relevant links only, up to 10 links):\n${values.sitemaps?.join('\n')}\n\n`
    }

    if (hasImages) {
      prompt += `\n- Images:\n${JSON.stringify(values.images, null, 2)}`
    }

    if (hasVideos) {
      prompt += `\n- Videos:\n${JSON.stringify(values.videos, null, 2)}`
    }

    // ## Contents
    // 1. [Example](#example)
    //    * [Sub-heading](#sub-heading)
    // 2. [Example2](#example2)
    // 3. [Third Example](#third-example)
    //    * [Sub-heading](#sub-heading)
    //    * [Sub-heading](#sub-heading)
    // 4. [Fourth Example](#fourth-example)

    prompt += `\nMarkdown Table of content example
## Contents
1. [Example](#example)
2. [Example2](#example2)
3. [Third Example](#third-example)

Write the outline following the structure below
`;


    // if (videos?.length > 0) {
    // prompt += `\n- Youtube videos (include relevant video(s) only, up to 1 video per section maximum, don't add a list of video at the end of the article):
    // - include relevant video(s) only
    // - up to 1 video per section maximum
    // - don't add a list of video at the end of the article
    // - don't put more than 1 video together
    // - here is how you embed it in the markdown => <p><iframe width="560" height="315" src="REPLACE_WITH_YOUTUBE_URL_HERE" title="" frameBorder="0"   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"  allowFullScreen></iframe></p>

    // ${JSON.stringify(videos, null, 2)}
    // `
    // }

    prompt += `\ntype Outline = {
  table_of_content_markdown: string; // don't include the article title but only h2 and, don't number them.
  sections: {
    name: string;
    word_count: number;
    keywords: string; // comma separated
    internal_links: string[]; // include relevant link you find in the sitemap, leave it empty otherwise.
    // include relevant images in the above list, leave it empty otherwise.`;

    if (hasImages) {
      prompt += `\n// include relevant images in the above list, leave it empty otherwise.\nimages: string[]; // ![alt](href)`
    }

    if (hasVideos) {
      prompt += `\n// youtube video
// include the most relevant video only (optional), up to 1 video per section
video_url: string;
`
    }

    prompt += `purposes?: string[];
    emotions?: string[];
    vocabularies?: string[];
    sentence_structures?: string[];
    perspectives?: string[];
    writing_structures?: string[];
    instructional_elements?: string[];
}[];`

    prompt += `\ntype Outline = {
  table_of_content_markdown: string; // don't include the article title but only h2 and, don't number them.
  sections: {
    name: string;
    word_count: number;
    keywords: string; // comma separated
    internal_links: string[]; // include relevant link you find in the sitemap, leave it empty otherwise.
    purposes?: string[];
    emotions?: string[];
    vocabularies?: string[];
    sentence_structures?: string[];
    perspectives?: string[];
    writing_structures?: string[];
    instructional_elements?: string[];
  }[];
}
`

    prompt += `\nOutput a JSON array wrapped in \`\`\`json\`\`\``

    return prompt
  }

  async outlinePlan(values: any) {
    return this.ask(this.outlinePlanTemplate(values), { type: "json", mode: "outline-plan", temperature: 0.3, model: models.opus });
  }

  metaDescriptionTemplate(values: any) {
    // Tone: ${values.tone ?? ""}
    // Purpose: ${values.purpose ?? ""}
    // Outline: ${values.outline}
    let prompt = `
    Headline: ${values.title}
    Content type: ${values.content_type ?? ""}
    Seed keyword: ${values.seed_keyword ?? ""}`


    prompt += this.opts?.writing_style?.purposes?.length > 0 ? `\nPurposes: ${this.opts?.writing_style?.purposes.join(', ')}` : "";
    prompt += this.opts?.writing_style?.emotions?.length > 0 ? `\nEmotions: ${this.opts?.writing_style?.emotions.join(', ')}` : "";
    prompt += this.opts?.writing_style?.vocabularies?.length > 0 ? `\nVocabularies: ${this.opts?.writing_style?.vocabularies.join(', ')}` : "";
    // prompt += this.opts?.writing_style?.sentence_structures?.length > 0 ? `\nSentence structures: ${this.opts?.writing_style?.sentence_structures.join(', ')}` : "";
    prompt += this.opts?.writing_style?.perspectives?.length > 0 ? `\nPerspectives: ${this.opts?.writing_style?.perspectives.join(', ')}` : "";

    if (values.keywords?.length > 0) {
      prompt += `\n- Keywords (include relevant keywords only):\n${values.keywords.join('\n')}\n\n`
    }

    prompt += `\nWrite a unique description and return a JSON object with the Meta structure.
    \`\`\`ts
    type Meta = {
      description: string; // max length 160, no emoji.
    }
    \`\`\`
    Wrap your output in \`\`\`json\`\`\``;

    return prompt
  }

  async metaDescription(values: any) {
    return this.ask(this.metaDescriptionTemplate(values), { type: "json", mode: "meta-description", temperature: 0.3, model: models.opus });
  }

  schemaMarkupNamesTemplate(values: any) {
    return `
    === Article
    ${values.article}

    === Instructions
    Give me a list of names of up to 5 structured json+ld schema that fit the best this article
    Output a json array

    Wrap your output in \`\`\`json\`\`\`
    `
  }

  async schemaMarkupNames(values: any) {
    return this.ask(this.schemaMarkupNamesTemplate(values), { type: "json", mode: "ld+json", temperature: 0.5, model: models.opus });
  }


  schemaMarkupTemplate(values: any) {
    return `
    === Product info
    name: ${values.project.name}
    description: ${values.project.description}
    website: ${values.project.website}
    meta tags:
    ${JSON.stringify(values.project.metatags ?? {}, null, 2)}

    === Article metadata
    meta description: ${values.meta_description}
    date: ${format(new Date(), "yyyy-MM-dd")}

    === Article
    ${values.article}

    === Instructions
    Write the structured data (ld+json) schema: ${values.schemaName}
    Your output is a json object and contains only this, no comment or text surrounding the json
    Never add the whole article in any of the properties of the markup

    Wrap your output in \`\`\`json\`\`\`
    `
  }

  async schemaMarkup(values: any) {
    return this.ask(this.schemaMarkupTemplate(values), { type: "json", mode: "ld+json", temperature: 0.5, model: models.opus });
  }

  getWritingCharacteristicsTemplate(text: string) {
    return `${text}

    ====

    Give me all the writing style characteristics of the above text among the list below:
    - tones: ${tones.map(i => i.label).join(", ")}
    - emotions: ${emotions.map(i => i.label).join(", ")}
    - purposes: ${purposes.map(i => i.label).join(", ")}
    - types of vocabulary used: ${vocabularies.map(i => i.label).join(", ")}
    - sentences structure, patterns: ${sentenceStructures.map(i => i.label).join(", ")}
    - perspectives used: ${perspectives.map(i => i.label).join(", ")}

    Output in the form of WritingCharacteristic.
    \`\`\`ts
    type WritingCharacteristic = {
      purposes?: string[];
      emotions?: string[];
      vocabularies?: string[];
      sentence_structures?: string[];
      perspectives?: string[];
      writing_structures?: string[];
      instructional_elements?: string[];
    }
    \`\`\`
    Wrap your output in \`\`\`json\`\`\`
    `
  }

  async getWritingCharacteristics(text: string) {
    console.log("ENTER 2", text)
    console.log("ENTER 3", this.getWritingCharacteristicsTemplate(text))
    return this.ask(this.getWritingCharacteristicsTemplate(text), { type: "json", mode: "get-writing-style", temperature: 0.5, model: models.opus });
  }

  getPSeoVariablesValueTemplate(values: any) {
    let prompt = `Give me a list of variable that will serve to create ${values.article_count} headlines of the following struture: "${values.title_structure}"`;

    prompt += `\nVariables:\n`;

    values.variables.forEach((i) => {
      prompt += `${i.variable}\n`
    })

    prompt += `\`\`\`ts
    type VariableName = string;
    type Variables = {
      [key: VariableName]: string;
    }[];
    // Example: [{variable_name: "value"}] (each object represent the variables of each article)
    \`\`\`
    `;

    prompt += `Wrap your output in \`\`\`json\`\`\``

    return prompt
  }

  async getPSeoVariablesValue(values: any) {
    return this.ask(this.getPSeoVariablesValueTemplate(values), { type: "json", mode: "get-programmatic-seo-variables", temperature: 0.1, model: models.opus });
  }

  getPSeoOutlineTemplate(values: any) {
    let prompt = `Write a generic ${values.content_type} outline for the article structure "${values.title_structure}".

    The template should be usable for different interpolation of the variables
    - the article will contains up to ${values.word_count} words
    - don't write the content
    - keep the variables`;

    prompt += values.with_introduction ? "\n- add an introduction, it is no more than 100 words (it never has sub-sections)" : "\n- do not add an introduction"
    prompt += values.with_conclusion ? "\n- add a conclusion, it is no more than 200 words (it never has sub-sections)" : "\n- do not add a conclusion"
    prompt += values.with_key_takeways ? "\n- add a key takeways, it is a list of key points or short paragraph (it never has sub-sections)" : "\n- do not add a key takeways"
    prompt += values.with_faq ? "\n- add a FAQ" : "\n- do not add a FAQ\n";

    prompt += `\n- Language: ${values.language}`

    if (values.additional_information) {
      prompt += `\n-Additional information: ${values.additional_information}`
    }

    prompt += `\nVariables:
    ${JSON.stringify(values.variables, null, 2)}`

    prompt += `\n// output structure
    \`\`\`ts
    type Template = {
      headings: string[];
    }
    \`\`\`
    Wrap your output in \`\`\`json\`\`\`
    `;

    return prompt;
  }

  async getPSeoOutline(values: any) {
    return this.ask(this.getPSeoOutlineTemplate(values), { type: "json", mode: "get-programmatic-seo-outline", temperature: 0.1, model: models.opus });
  }

  getCaptionTemplate(values: CaptionTemplate) {
    const platform = capitalize(values.platform)
    let prompt = ""

    prompt += `- Language: ${values.language}`
    if (values.tones) prompt += values.tones?.length > 0 ? `\nTones: ${values.tones.join(', ')}` : "";
    if (values.purposes) prompt += values.purposes?.length > 0 ? `\nPurposes: ${values.purposes.join(', ')}` : "";
    if (values.emotions) prompt += values.emotions?.length > 0 ? `\nEmotions: ${values.emotions.join(', ')}` : "";
    if (values.vocabularies) prompt += values.vocabularies?.length > 0 ? `\nVocabularies: ${values.vocabularies.join(', ')}` : "";
    if (values.sentence_structures) prompt += values.sentence_structures?.length > 0 ? `\nSentence structures: ${values.sentence_structures.join(', ')}` : "";
    if (values.perspectives) prompt += values.perspectives?.length > 0 ? `\nPerspectives: ${values.perspectives.join(', ')}` : "";
    if (values.writing_structures) prompt += values.writing_structures?.length > 0 ? `\nWriting structures: ${values.writing_structures.join(', ')}` : "";
    if (values.instructional_elements) prompt += values.instructional_elements?.length > 0 ? `\nInstructional elements: ${values.instructional_elements.join(', ')}` : "";

    if (values.with_hook) prompt += "\n- Add a hook";
    if (values.with_question) prompt += "\n- Add a question to engage the readers";
    prompt += values.with_hashtags ? "\n- Add hashtags" : "\n- do not add hashtags"
    if (values.with_emojis && !values.with_single_emoji) prompt += "\n- Add emojis"
    if (values.with_single_emoji && !values.with_emojis) prompt += "\n- Add one emoji"
    if (!values.with_single_emoji && !values.with_emojis) prompt += "\n- Do not add emojis"
    if (values.with_cta && values.cta) prompt += `\n- CTA: ${values.cta}`
    if (!values.with_cta) prompt += `\n- Do not add any CTA`

    if (values.writingStyle) prompt += `\n\nHere is my writing style: ${values.writingStyle}\n`;

    if (values.goal === "write") {
      prompt += `\n-${capitalize(values.goal)} a ${platform} caption of up to ${values.caption_length} characters maximum about: ${values.description}.`
    }

    if (values.goal === "rephrase" && values.caption_source) {
      prompt += `\n-Rephrase (while keeping the level of similary/duplication low) using my writing style the following ${platform} caption to up to ${values.caption_length} characters maximum about, caption source to rephrase: "${values.caption_source}"\n`
      prompt += `\n-Don't copy or add any links you find in the caption source`
      prompt += `\n-Don't add/make up links unless I provide it to you`
    }

    if (values.goal === "reply" && values.caption_source) {
      prompt += `\n-Reply to the following ${platform} caption using my writing style to up to ${values.caption_length} characters maximum about, caption source to reply: "${values.caption_source}"\n`
      prompt += `\n-Don't copy or add any links you find in the caption source`
      prompt += `\n-Don't add/make up links unless I provide it to you`
    }


    if (values.goal === "youtube_to_caption" && values.youtube_transcript) {
      prompt += `\n-Write a ${platform} caption of up to ${values.caption_length} characters maximum about: ${values.youtube_transcript.slice(0, 10000)}.`
      prompt += `\n\n-Don't copy or add any links you find in the caption source`
      prompt += `\n-Don't add/make up links unless I provide it to you`
    }

    prompt += `\n\n// output structure
    \`\`\`ts
    type Result = {
      caption: string;
    }
    \`\`\`
    Wrap your output in \`\`\`json\`\`\`
    `;

    return prompt;
  }

  async getCaption(values: CaptionTemplate): Promise<{ caption: string }> {
    return this.ask(this.getCaptionTemplate(values), { type: "json", mode: "get-caption", temperature: 0.7, model: models.opus });
  }
}

