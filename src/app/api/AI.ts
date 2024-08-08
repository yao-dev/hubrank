import Anthropic from "@anthropic-ai/sdk";
import yaml from 'js-yaml';
import { getSummary } from 'readability-cyr';
import { normalizePrompt } from "./helpers";
// import { countTokens } from '@anthropic-ai/tokenizer';
import chalk from 'chalk';
import { format } from "date-fns";
import OpenAI from "openai";
import { avoidWords, emotions, instructionalElements, perspectives, purposes, sentenceStructures, tones, vocabularies, writingStructures } from "@/options";
import { capitalize, isEmpty, shuffle } from "lodash";

export type CaptionTemplate = {
  platform: string;
  goal: "write" | "rephrase" | "reply" | "youtube_to_caption";
  caption_length: number;
  description: string;
  with_hashtags?: boolean;
  with_emojis?: boolean;
  with_single_emoji?: boolean;
  with_question?: boolean;
  with_hook?: boolean;
  with_cta?: boolean;
  cta?: string;
  caption_source?: string;
  language: string;
  writingStyle?: {
    text?: string;
    tones?: string[];
    purposes?: string[];
    emotions?: string[];
    vocabularies?: string[];
    sentence_structures?: string[];
    perspectives?: string[];
    writing_structures?: string[];
    instructional_elements?: string[];
  };
  external_sources?: {
    url: string;
    objective: string
  };
  youtube_transcript?: string
}

type GetRelevantKeywords = {
  title: string;
  seed_keyword: string;
  keywords: string[];
  count: number;
}

type GetRelevantUrls = {
  title: string;
  seed_keyword: string;
  urls: string[],
  count: number
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

export const models = {
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
    this.system = `You are a Storyteller & SEO writer expert who writes engaging content that speak to the right target audience.`

    if (opts.context) this.system += `\nProduct info:\n${opts.context}\n===`
    if (opts.writing_style) {
      this.system += `\nWriting style example to imitate:\n${opts.writing_style.text}`
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
    // this.article += `\n${content.replaceAll(".", ".\n")}\n`;
    this.article += `\n${content}\n`;
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
        model: opts.model,
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
        // model: models["gpt-4-0613"],
        model: opts.model,
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

    let prompt = `[headline]

    ${prefix}

    Give me ${values.count} unique and SEO friendly ${values.count <= 1 ? "headline" : "headlines"} made for the search intent "${values.seedKeyword}"
    - the content type is "${values.contentType}"
    - one headline per line
    - do not prefix with number
    - IMPORTANT: avoid words like: ${avoidWords.join()}
    ${values.clickbait ? "- make it clickbait" : ""}`;

    if (values.writingStyle?.text) prompt += `\n\nCopy the tone and writing style of this text: ${values.writingStyle.text}`;

    prompt += `\n\nStart and end your writing with triple @@@.`

    return prompt
  }

  async headlines(values: any) {
    const temperature = shuffle([0.4, 0.5, 0.6])[0]
    return this.ask(this.headlinesTemplate(values), { mode: "headlines", temperature, model: models["gpt-4o"] });
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
    let prompt = `[hook]

    Outline: ${values?.outline}
    Seed keyword: ${values?.seed_keyword}
    `;

    prompt += this.opts?.writing_style?.tones?.length > 0 ? `\nTones: ${this.opts?.writing_style?.tones.join(', ')}` : "";
    prompt += this.opts?.writing_style?.purposes?.length > 0 ? `\nPurposes: ${this.opts?.writing_style?.purposes.join(', ')}` : "";
    prompt += this.opts?.writing_style?.emotions?.length > 0 ? `\nEmotions: ${this.opts?.writing_style?.emotions.join(', ')}` : "";
    prompt += this.opts?.writing_style?.vocabularies?.length > 0 ? `\nVocabularies: ${this.opts?.writing_style?.vocabularies.join(', ')}` : "";
    prompt += this.opts?.writing_style?.perspectives?.length > 0 ? `\nPerspectives: ${this.opts?.writing_style?.perspectives.join(', ')}` : "";

    if (!isEmpty(values?.keywords)) {
      prompt += `\n\nKeywords:\n${values.keywords.join('\n')}\n`
    }

    prompt += `
    Write an engaging introduction (typically ranging from one to two sentences or around 20-50 words) for the article "${values?.title}"
    Choose the hook type that fit the best this article, (Question, Anecdote, Fact/Statistic, Quotation, Bold Statement, Problem-Solution, Surprise, Empathy, Challenge, Personal Story, Prediction, Curiosity, Humor, Rhetorical Question, Metaphor/Analogy)
    - IMPORTANT: avoid words like: ${avoidWords.join()}

    write in markdown wrapped in \`\`\`markdown\`\`\`.
    `;

    return prompt;
  }

  async hook(values: any) {
    const temperature = shuffle([0.3, 0.4, 0.5, 0.7, 0.8])[0]
    return this.ask(this.hookTemplate(values), { type: "markdown", mode: "hook", temperature, model: models["gpt-4-0613"] })
  }

  writeTemplate(values: any) {
    const hasImage = !!values?.section?.image;
    const hasImages = values?.section?.images?.length > 0;
    const hasVideo = !!values.section?.video_url;

    // prompt += `\nHeadline structure: ${body.title_structure}`;
    // prompt += `\nHeadline (do not add it in the output): ${body.title}`;
    // prompt += `\nReplace all variables with their respective value.`;

    let prompt = `[write]

    For the article "${values?.title}" write the section "${values?.section?.name}" with a maximum of ${values?.section?.word_count} words in markdown wrapped in \`\`\`markdown\`\`\`.
    Section heading prefix: ${values?.section?.prefix}
    Do not add a CTA at the end
    Do not add heading for the hook if there is any
    Do not make up fact, statistic or fake story
    `

    if (values.pseo) {
      prompt = `[write/pseo]

      For the article "${values?.title}" write the section "${values?.section?.name}" with a maximum of ${values?.section?.word_count} words in markdown wrapped in \`\`\`markdown\`\`\`.
      Title structure: ${values.title_structure}
      Replace all variables with their respective value.
      Section heading prefix: ${values?.section?.prefix}
      Do not add a CTA at the end
      Do not add heading for the hook if there is any
      Do not make up fact, statistic or fake story

      Variables:
      ${JSON.stringify(values.variables, null, 2)}
    `
    }
    // prompt += `Outline: ${values?.outline}`

    prompt += values?.section?.tones?.length > 0 ? `\nTones: ${values.section.tones.join(', ')}` : "";
    prompt += values?.section?.purposes?.length > 0 ? `\nPurposes: ${values.section.purposes.join(', ')}` : "";
    prompt += values?.section?.emotions?.length > 0 ? `\nEmotions: ${values.section.emotions.join(', ')}` : "";
    prompt += values?.section?.vocabularies?.length > 0 ? `\nVocabularies: ${values.section.vocabularies.join(', ')}` : "";
    prompt += values?.section?.sentence_structures?.length > 0 ? `\nSentence structures: ${values.section.sentence_structures.join(', ')}` : "";
    prompt += values?.section?.perspectives?.length > 0 ? `\nPerspectives: ${values.section.perspectives.join(', ')}` : "";
    prompt += values?.section?.writing_structures?.length > 0 ? `\nWriting structures: ${values.section.writing_structures.join(', ')}` : "";
    prompt += values?.section?.instructional_elements?.length > 0 ? `\nInstructional elements: ${values.section.instructional_elements.join(', ')}` : "";

    prompt += `\n\nRelevant keywords: ${values?.section?.keywords}\n`

    if (values?.section?.call_to_action) {
      prompt += `\nCall to action instructions:\n${values.section.call_to_action}`;
      if (values?.section?.call_to_action_example) {
        prompt += `\nCall to action instructions:\n${values.section.call_to_action}`
      }
    }

    if (values?.section?.internal_links?.length > 0) {
      prompt += `\nInternal links to include:\n${values.section.internal_links?.join('\n')}\n\n`
    }

    if (hasImage) {
      prompt += `\n- Include @@image@@ as a placeholder for the image: "${values.section.image.alt}" (DO NOT EMBED THE IMAGE)`
      // prompt += `\nImage to include: ${values.section.image}`
    }

    if (hasImages) {
      prompt += `\nImages to include: ${JSON.stringify(values?.section?.images ?? "", null, 2)}`
    }

    if (hasVideo) {
      prompt += `\nVideo to include:
      // here is how you embed it in the markdown => <iframe width="560" height="315" src="https://www.youtube.com/embed/REPLACE_WITH_YOUTUBE_VIDEO_ID" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
      video url: ${values.section.video_url}\n`
    }

    if ((hasImage || hasImages) && hasVideo) {
      prompt += `\nDon't put image and video next to each other, preferrably not both in the same section`
    }

    // - You know how to transition from a section to another at the end of a section.
    // - Simplify Words
    // - Avoid Hard-to-Read Phrases
    prompt += `
    Primary instructions:
    - Leverage markdown syntaxes (strikethrough, table, italic, bold, quote, etc.) to make the content appealing and easier to read.
    - Add h3 sub-sections with ### if the content as more than 2 paragraphs.
    - Don't use h1 at all.
    - Add anchor to the section here is an example for a h2: ## <a name="heading-example"></a>Heading example
    - Prefer Active Voice
    - Avoid the use of adverbs as much as possible
    - Avoid Passive Voice
    - Consider Sentence Variety
    - IMPORTANT: Do not use adverbs at all
    - IMPORTANT: Diversify vocabulary
    - IMPORTANT: vary the sentence structure and tone to make it sound more conversational.
    - IMPORTANT: avoid words like: ${avoidWords.join()}
    - do not use emojis
    - do not introduce any next section`

    // if (values?.section?.image?.alt && values?.section?.image?.href) {
    //   // prompt += `\n- Include this image in the content: ![${values.section.image.alt}](${values.section.image.href})`
    //   prompt += `\n- Include @@image@@ as a placeholder for the image: "${values.section.image.alt}" (DO NOT EMBED THE IMAGE)`
    // }

    if (values?.section?.custom_prompt) {
      prompt += `\nSecondary instructions (does not override primary instructions):\n${values?.section?.custom_prompt}`
    }

    return prompt.replaceAll("\t", "")
  }

  async write(values: any) {
    const model = shuffle([models["gpt-4o"], models["gpt-4-0613"]])[0];
    const temperature = shuffle([0.3, 0.4, 0.5, 0.7, 0.8])[0]
    return this.ask(this.writeTemplate(values), { type: "markdown", mode: "write", word_count: values.word_count, temperature, model });
  }

  rephraseTemplate(content: any) {
    const stats = getSummary(content)
    return `[rephrase]\n\nThere is ${stats.difficultWords} difficult words in this text and the Flesch Kincaid Grade is ${parseInt(stats.FleschKincaidGrade)}

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
  `, { type: "markdown", mode: "rephrase", temperature: 0, model: models["gpt-4-0613"] });
    //   return this.ask(`
    //   "${section}"

    //   ${this.rephraseTemplate(section)}
    // `, { type: "markdown", mode: "rephrase", temperature: 0.3, model: models.opus });
  }

  paraphraseTemplate(writingStyle = "") {
    return `[paraphrase]\n\nParaphrase the above text using the style of the following text:

    "${writingStyle}"

    Write in markdown wrapped in \`\`\`markdown\`\`\`.`
  }

  async paraphrase(section: any, writingStyle: any) {
    return this.ask(`
    "${section}"

    ${this.paraphraseTemplate(writingStyle)}
  `, { type: "markdown", mode: "paraphrase", temperature: 0.4, model: models["gpt-4-0613"] });
  }

  outlinePlanTemplate(values: any) {
    const hasImages = values?.images?.length > 0;
    const hasVideos = values?.videos?.length > 0;
    // - number of heading: ${values.heading_count}
    let prompt = `[outline plan]\n\nWrite an article outline for the headline: "${values.title}"
- the content type is ${values.content_type}
- the article has no more than ${values.word_count} words length
- a section that has more than 200 words should be split into sub-sections or paragraphs`;

    if (values.youtube_transcript) {
      prompt += `\nWrite the article based on this youtube transcript: ${values.youtube_transcript.slice(0, 10000)}`
    }

    prompt += values.writingStyle?.purposes?.length > 0 ? `\nPurposes: ${values.writingStyle.purposes.join(', ')}` : "";
    prompt += values.writingStyle?.emotions?.length > 0 ? `\nEmotions: ${values.writingStyle.emotions.join(', ')}` : "";
    prompt += values.writingStyle?.vocabularies?.length > 0 ? `\nVocabularies: ${values.writingStyle.vocabularies.join(', ')}` : "";
    prompt += values.writingStyle?.sentence_structures?.length > 0 ? `\nSentence structures: ${values.writingStyle.sentence_structures.join(', ')}` : "";
    prompt += values.writingStyle?.perspectives?.length > 0 ? `\nPerspectives: ${values.writingStyle.perspectives.join(', ')}` : "";
    prompt += values.writingStyle?.writing_structures?.length > 0 ? `\nWriting structures: ${values.writingStyle.writing_structures.join(', ')}` : "";
    prompt += values.writingStyle?.instructional_elements?.length > 0 ? `\nInstructional elements: ${values.writingStyle.instructional_elements.join(', ')}` : "";

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

    // if (hasImages) {
    //   prompt += `\n- Images:\n${JSON.stringify(values.images.slice(0, 2), null, 2)}`
    // }

    if (hasVideos) {
      prompt += `\n- Videos:\n${JSON.stringify(values.videos.slice(0, 2), null, 2)}`
    }

    prompt += `\nMarkdown Table of content example
## Contents
1. [Example](#example)
2. [Example2](#example2)
3. [Third Example](#third-example)

Write the outline following the structure below
`;

    prompt += `\ntype Outline = {
  table_of_content_markdown: string; // don't include the article title but only h2 and, don't number them.
  sections: {
    name: string;
    word_count: number;
    keywords: string; // comma separated
    internal_links: string[]; // include relevant link you find in the sitemap, leave it empty otherwise.
    // include relevant images in the above list, leave it empty otherwise.`;

    // if (hasImages) {
    //   prompt += `\n// include relevant images in the above list, leave it empty otherwise.\nimages: string[]; // @@image@@`
    // }

    if (hasVideos) {
      prompt += `\n// youtube video
// include the most relevant video only (optional), up to 1 video per article
video_url: string;
`
    }

    prompt += `purposes?: string[]; // options: ${purposes.map(i => i.label).join()}
    emotions?: string[]; // options: ${emotions.map(i => i.label).join()}
    vocabularies?: string[]; // options: ${vocabularies.map(i => i.label).join()}
    sentence_structures?: string[]; // options: ${sentenceStructures.map(i => i.label).join()}
    perspectives?: string[]; // options: ${perspectives.map(i => i.label).join()}
    writing_structures?: string[]; // options: ${writingStructures.map(i => i.label).join()}
    instructional_elements?: string[]; // options: ${instructionalElements.map(i => i.label).join()}
    tones?: string[]; // options: ${tones.map(i => i.label).join()}
}[];
  };`

    prompt += `\nOutput a JSON object wrapped in \`\`\`json\`\`\``

    return prompt
  }

  async outlinePlan(values: any) {
    return this.ask(this.outlinePlanTemplate(values), { type: "json", mode: "outline-plan", temperature: 0.3, model: models["gpt-4o"] });
  }

  metaDescriptionTemplate(values: any) {
    let prompt = `[description]

    Headline: ${values.title}
    Content type: ${values.content_type ?? ""}
    Seed keyword: ${values.seed_keyword ?? ""}
    Outline: ${values.outline ?? ""}
    `

    prompt += this.opts?.writing_style?.tones?.length > 0 ? `\nTones: ${this.opts?.writing_style?.tones.join(', ')}` : "";
    prompt += this.opts?.writing_style?.purposes?.length > 0 ? `\nPurposes: ${this.opts?.writing_style?.purposes.join(', ')}` : "";
    prompt += this.opts?.writing_style?.emotions?.length > 0 ? `\nEmotions: ${this.opts?.writing_style?.emotions.join(', ')}` : "";
    prompt += this.opts?.writing_style?.vocabularies?.length > 0 ? `\nVocabularies: ${this.opts?.writing_style?.vocabularies.join(', ')}` : "";
    prompt += this.opts?.writing_style?.perspectives?.length > 0 ? `\nPerspectives: ${this.opts?.writing_style?.perspectives.join(', ')}` : "";

    if (values.keywords?.length > 0) {
      prompt += `\n- Keywords (include relevant keywords only):\n${values.keywords.join('\n')}\n\n`
    }

    prompt += `\n\n
    - IMPORTANT: avoid words like: ${avoidWords.join()}

    Write a valuable and search intent driven description for search engine and return a JSON object with the type Description.
    \`\`\`ts
    type Description = {
      description: string; // max length 160, no emoji.
    }
    \`\`\`
    Wrap your output in \`\`\`json\`\`\``;

    return prompt
  }

  async metaDescription(values: any) {
    return this.ask(this.metaDescriptionTemplate(values), { type: "json", mode: "meta-description", temperature: 0.7, model: models["gpt-4-0613"] });
  }


  schemaMarkupTemplate(values: any) {
    return `[schema markup]

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
    Write the structured data (ld+json) schema type: ${values.schemaName}
    Your output is a json object and contains only this, no comment or text surrounding the json
    Never add the whole article in any of the properties of the markup

    Wrap your output in \`\`\`json\`\`\`
    `
  }

  async schemaMarkup(values: any) {
    return this.ask(this.schemaMarkupTemplate(values), { type: "json", mode: "ld+json", temperature: 0.5, model: models["gpt-4o"] });
  }

  getWritingCharacteristicsTemplate(text: string) {
    return `[writing characteristics]

    ${text}

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
      tones?: string[];
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
    return this.ask(this.getWritingCharacteristicsTemplate(text), { type: "json", mode: "get-writing-style", temperature: 0.5, model: models["gpt-4o"] });
  }

  getPSeoOutlineTemplate(values: any) {
    const hasVideos = values?.videos?.length > 0;

    let prompt = `[pseo outline]\n\nWrite a generic ${values.content_type} outline for the article structure "${values.title_structure}".
- The template should be usable for different interpolation of the variables
- keep the variables
- the content type is ${values.content_type}
- the article has no more than ${values.word_count} words length
- a section that has more than 200 words should be split into sub-sections or paragraphs`;

    if (values.youtube_transcript) {
      prompt += `\nWrite the article based on this youtube transcript: ${values.youtube_transcript.slice(0, 10000)}`
    }

    prompt += values.writingStyle?.purposes?.length > 0 ? `\nPurposes: ${values.writingStyle.purposes.join(', ')}` : "";
    prompt += values.writingStyle?.emotions?.length > 0 ? `\nEmotions: ${values.writingStyle.emotions.join(', ')}` : "";
    prompt += values.writingStyle?.vocabularies?.length > 0 ? `\nVocabularies: ${values.writingStyle.vocabularies.join(', ')}` : "";
    prompt += values.writingStyle?.sentence_structures?.length > 0 ? `\nSentence structures: ${values.writingStyle.sentence_structures.join(', ')}` : "";
    prompt += values.writingStyle?.perspectives?.length > 0 ? `\nPerspectives: ${values.writingStyle.perspectives.join(', ')}` : "";
    prompt += values.writingStyle?.writing_structures?.length > 0 ? `\nWriting structures: ${values.writingStyle.writing_structures.join(', ')}` : "";
    prompt += values.writingStyle?.instructional_elements?.length > 0 ? `\nInstructional elements: ${values.writingStyle.instructional_elements.join(', ')}` : "";

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

    // if (hasImages) {
    //   prompt += `\n- Images:\n${JSON.stringify(values.images.slice(0, 2), null, 2)}`
    // }

    if (hasVideos) {
      prompt += `\n- Videos:\n${JSON.stringify(values.videos.slice(0, 2), null, 2)}`
    }


    prompt += `\nVariables:\n${JSON.stringify(values.variables, null, 2)}`

    prompt += `\nMarkdown Table of content example
## Contents
1. [Example](#example)
2. [Example2](#example2)
3. [Third Example](#third-example)

Write the outline following the structure below
`;

    prompt += `\ntype Outline = {
  heading: string;
  table_of_content_markdown: string; // don't include the article title but only h2 and, don't number them.
  sections: {
    name: string;
    word_count: number;
    keywords: string; // comma separated
    internal_links: string[]; // include relevant link you find in the sitemap, leave it empty otherwise.
    // include relevant images in the above list, leave it empty otherwise.`;

    // if (hasImages) {
    //   prompt += `\n// include relevant images in the above list, leave it empty otherwise.\nimages: string[]; // @@image@@`
    // }

    if (hasVideos) {
      prompt += `\n// youtube video
// include the most relevant video only (optional), up to 1 video per article
video_url: string;
`
    }

    prompt += `purposes?: string[]; // options: ${purposes.map(i => i.label).join()}
    emotions?: string[]; // options: ${emotions.map(i => i.label).join()}
    vocabularies?: string[]; // options: ${vocabularies.map(i => i.label).join()}
    sentence_structures?: string[]; // options: ${sentenceStructures.map(i => i.label).join()}
    perspectives?: string[]; // options: ${perspectives.map(i => i.label).join()}
    writing_structures?: string[]; // options: ${writingStructures.map(i => i.label).join()}
    instructional_elements?: string[]; // options: ${instructionalElements.map(i => i.label).join()}
    tones?: string[]; // options: ${tones.map(i => i.label).join()}
}[];
  };`

    prompt += `\nOutput a JSON object wrapped in \`\`\`json\`\`\``

    return prompt
  }

  async getPSeoOutline(values: any) {
    return this.ask(this.getPSeoOutlineTemplate(values), { type: "json", mode: "get-pseo-outline", temperature: 0.2, model: models["gpt-4o"] });
  }

  getCaptionTemplate(values: CaptionTemplate) {
    const platform = capitalize(values.platform)
    let prompt = "[caption]\n\n"

    prompt += `- Language: ${values.language}`
    if (values.writingStyle?.tones) prompt += values.writingStyle.tones?.length > 0 ? `\nTones: ${values.writingStyle.tones.join(', ')}` : "";
    if (values.writingStyle?.purposes) prompt += values.writingStyle.purposes?.length > 0 ? `\nPurposes: ${values.writingStyle.purposes.join(', ')}` : "";
    if (values.writingStyle?.emotions) prompt += values.writingStyle.emotions?.length > 0 ? `\nEmotions: ${values.writingStyle.emotions.join(', ')}` : "";
    if (values.writingStyle?.vocabularies) prompt += values.writingStyle.vocabularies?.length > 0 ? `\nVocabularies: ${values.writingStyle.vocabularies.join(', ')}` : "";
    if (values.writingStyle?.sentence_structures) prompt += values.writingStyle.sentence_structures?.length > 0 ? `\nSentence structures: ${values.writingStyle.sentence_structures.join(', ')}` : "";
    if (values.writingStyle?.perspectives) prompt += values.writingStyle.perspectives?.length > 0 ? `\nPerspectives: ${values.writingStyle.perspectives.join(', ')}` : "";
    if (values.writingStyle?.writing_structures) prompt += values.writingStyle.writing_structures?.length > 0 ? `\nWriting structures: ${values.writingStyle.writing_structures.join(', ')}` : "";
    if (values.writingStyle?.instructional_elements) prompt += values.writingStyle.instructional_elements?.length > 0 ? `\nInstructional elements: ${values.writingStyle.instructional_elements.join(', ')}` : "";

    if (values.with_hook) prompt += "\n- Add a hook";
    if (values.with_question) prompt += "\n- Add a question to engage the readers";
    prompt += values.with_hashtags ? "\n- Add hashtags" : "\n- do not add hashtags"
    if (values.with_emojis && !values.with_single_emoji) prompt += "\n- Add emojis"
    if (values.with_single_emoji && !values.with_emojis) prompt += "\n- Add one emoji"
    if (!values.with_single_emoji && !values.with_emojis) prompt += "\n- Do not add emojis"
    if (values.with_cta && values.cta) prompt += `\n- CTA: ${values.cta}`
    if (!values.with_cta) prompt += `\n- Do not add any CTA`

    if (values.writingStyle?.text) prompt += `\n\nHere is my writing style: ${values.writingStyle.text}\n`;

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
    const model = values.goal === "youtube_to_caption" && values.youtube_transcript ? models["gpt-4o"] : models["gpt-4-0613"]
    return this.ask(this.getCaptionTemplate(values), { type: "json", mode: "get-caption", temperature: 0.7, model });
  }

  getRelevantKeywordsTemplate(values: GetRelevantKeywords) {
    return [
      '[relevant keywords]',
      `Give me the ${values.count} most sementically relevants (min >70% relevancy percentage) keywords in the list based on the title "${values.title}" and this seed keyword "${values.seed_keyword}"`,
      `keywords list:\n- ${values.keywords.join('\n- ')}`,
      `Return an json array (string[]) and wrap your output in \`\`\`json\`\`\``
    ].join('\n\n')
  }

  async getRelevantKeywords(values: GetRelevantKeywords) {
    return this.ask(this.getRelevantKeywordsTemplate(values), { type: "json", mode: "get-relevant-keywords", temperature: 0.3, model: models["gpt-4o"] });
  }

  getRelevantUrlsTemplate(values: GetRelevantUrls) {
    return [
      '[relevant urls]',
      `Give me the ${values.count} most sementically relevants (min >70% relevancy percentage) urls in the list based on the title "${values.title}" and this seed keyword "${values.seed_keyword}"`,
      `urls list:\n- ${values.urls.join('\n- ')}`,
      `Return an json array (string[]) and wrap your output in \`\`\`json\`\`\``
    ].join('\n\n')
  }

  async getRelevantUrls(values: GetRelevantUrls) {
    return this.ask(this.getRelevantUrlsTemplate(values), { type: "json", mode: "get-relevant-urls", temperature: 0.3, model: models["gpt-4o"] });
  }
}

