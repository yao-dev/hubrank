import Anthropic from "@anthropic-ai/sdk";
import yaml from 'js-yaml';
import { getSummary } from 'readability-cyr';
import { normalizePrompt } from "./helpers";
import { countTokens } from '@anthropic-ai/tokenizer';
import chalk from 'chalk';

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
  }
}

const models = {
  opus: "claude-3-opus-20240229",
  sonnet: "claude-3-sonnet-20240229",
}

type TokenCountArgs = {
  text: string,
  model: "claude-3-opus-20240229" | "claude-3-sonnet-20240229" | "claude-2.1" | "claude-2.0" | "claude-instant-1.2",
  mode: "input" | "output"
}

type Opts = {
  context?: string,
  writing_style?: string
}

export class AI {
  messages: any = [];
  system = "";
  article = "";
  ai: any;
  cost: number = 0;

  constructor(opts: Opts = {}) {
    this.ai = new Anthropic({
      baseURL: "https://anthropic.hconeai.com/",
      apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY, // defaults to process.env["ANTHROPIC_API_KEY"]
      defaultHeaders: {
        "Helicone-Auth": `Bearer ${process.env.NEXT_PUBLIC_HELICONE_AUTH}`,
      },
    });
    this.system = `You are an expert SEO writer who writes using Hemingway principles (grade 10) and writes engaging content that speak to the right target audience.

    ${opts.context ? `Product info:\n${opts.context}\n===\n` : ""}

    ${opts.writing_style ? `Writing style to copy:\n${opts.writing_style}` : ""}
    `
      .trim()
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
      default:
        return
    }
  }

  extractText(text: string, type: string) {
    if (text.indexOf("@@@") !== -1) {
      return text.slice(text.indexOf("@@@") + 3, text.lastIndexOf("@@@"));
    }
    const regex: any = this.getExtractionRegex(type);
    const match = text.match(regex);

    if (match && match.length >= 2) {
      return match[1].trim();
    }
    return "";
  }

  parse(text: string, contentType: string = "") {
    if (text.indexOf("@@@") !== -1) {
      return text.slice(text.indexOf("@@@") + 3, text.lastIndexOf("@@@"));
    }

    let content = text;
    // const marker = "```" + contentType;

    if (["json", "yml", "yaml"].includes(contentType)) {
      content = this.extractText(text, contentType) || content;
      // content = text.slice(text.indexOf(marker) + marker.length, text.lastIndexOf("```"));

      if (contentType === "json") {
        return JSON.parse(content)
      }
      if (contentType === "yml" || contentType === "yaml") {
        return yaml.load(content)
      }
    }

    return content;
  }

  addArticleContent(content: any) {
    this.article += `${content}\n`;
  }

  addTokenCost({ text, model, mode }: TokenCountArgs) {
    const modelCost = costs[model][mode];
    const tokens = countTokens(text);
    const modelCostPerToken = (modelCost / costs[model].calculation_based_on_token_count)
    const totalCost = tokens * modelCostPerToken;

    this.cost += totalCost;
    console.log(chalk.blueBright(`[AI]: tokens: ${tokens} | cost: ${totalCost}`));
  }

  async ask(prompt: any, opts: any = {}) {
    prompt = normalizePrompt(prompt);
    console.log(chalk.blueBright(`[AI]: ${opts.mode || "ask"}`));
    console.log(chalk.yellow(`[AI]: prompt\n${prompt}`));

    const start = performance.now();

    this.addTokenCost({ text: `${this.system} ${prompt}`, model: opts.model, mode: "input" });

    const completion = await this.ai.beta.messages.create({
      model: opts.model || "claude-3-sonnet-20240229",
      max_tokens: opts.word_count ? opts.word_count * 2 : 1000,
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

    this.addTokenCost({ text: completion.content[0].text, model: opts.model, mode: "output" });

    const end = performance.now();
    console.log(chalk.blueBright(`[AI]: duration: ${(end - start) / 1000}`));

    return this.parse(completion.content[0].text, opts.type)
  }

  headlinesTemplate(values: any) {
    // Write the headlines wrapped within triple @@@.

    const prefix = values.isInspo ? `headline inspo: ${values.inspo_title}` : `List of competitors headline ranking in the 1st page of the SERP for the keyword "${values.seedKeyword}":
- ${values.competitorsHeadlines.join('\n- ')}`

    if (values.writingStyle) {
      return `${prefix}

Give me 10 unique and SEO friendly headlines made for the search intent "${values.seedKeyword}"
- your purpose is ${values.purpose}
- the content type is "${values.contentType}"
- one headline per line
- do not add any text formatting
${values.clickbait ? "- make it clickbait" : ""}

Copy the tone and writing style of this text: ${values.writingStyle}

Start and end your writing with triple @@@.
      `
    }

    return `${prefix}

    Give me 10 unique and SEO friendly headlines made for the search intent "${values.seedKeyword}"
    - your tone is ${values.tone}
    - your purpose is ${values.purpose}
    - the content type is "${values.contentType}"
    ${values.clickbait ? "- make it clickbait" : ""}
    - one headline per line

    Start and end your writing with triple @@@.
    `
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

  outlineIdeaTemplate(values: any) {
    return `Write an outline for: "${values.title}"
    - the outline must have ${values.heading_count} sections
    - ${values.introduction ? "add an introduction" : "do not add an introduction"}
    - ${values.conclusion ? "add a conclusion/summary" : "do not add a conclusion"}
    - ${values.key_takeways ? "add a key takeways" : "do not add a key takeways"}
    - ${values.faq ? "add a FAQ" : "do not add a FAQ"}
    - list of keywords to choose from to include in the section titles: ${values.keywords.join(',')}
    - Language: ${values.language}

    Wrap the outline in a well formated JSON array wrapped in \`\`\`json\`\`\` follow the structure shown below
    \`\`\`json
    [
      "section name 1",
      "section name 2",
      "section name 3",
    ]
    \`\`\`
    `
  }

  async outlines(values: any) {
    return this.ask(this.outlineIdeaTemplate(values), { type: "json", mode: "outlines", temperature: 0.7, model: models.sonnet });
  }

  outlineTemplate(values: any) {
    return `Write an article outline for: "${values.title}"
    - the article contains ${values.word_count} words
    - add the word count for each section and sub-section
    - a section might have text before its sub-sections
    - a section that has more than 200 words should be split into sub-sections
    - a sub-section is optional
    - a sub-section has no more than 200 words
    - ${values.introduction ? "add an introduction, it is no more than 100 words (it never has sub-sections)" : "do not add an introduction"}
    - ${values.conclusion ? "add a conclusion/summary, it is no more than 200 words (it never has sub-sections)" : "do not add a conclusion"}
    - ${values.key_takeways ? "add a key takeways , it is a list of key points or short paragraph (it never has sub-sections)" : "do not add a key takeways"}
    - ${values.faq ? "add a FAQ" : "do not add a FAQ"}
    - list of keywords to choose from to include in the section titles: ${values.keywords}
    - make sure the sum of all sections (sub-sections not included) equals ${values.word_count} words
    - Language: ${values.language}
    - number of heading: ${values.heading_count}

    Write the outline formatted in YAML like the example below.
    \`\`\`yaml
    sections:
      - title:
        word_count: 100
      - title:
        word_count: 300
        sub_sections:
          - title:
            word_count: 100
          - title:
            word_count: 100
    \`\`\`
    `
  }

  async outline(values: any) {
    return this.ask(this.outlineTemplate(values), { type: "yaml", mode: "outline", temperature: 0.7, model: models.sonnet });
  }

  hookTemplate(values: any) {
    return `
    Outline: ${values?.outline}
    Seed keyword: ${values?.seed_keyword}
    perspective: ${values?.perspective}

    Write a hook (typically ranging from one to three sentences or around 20-50 words) for the article "${values?.title}"
    write in markdown wrapped in \`\`\`markdown\`\`\`.`
  }

  async hook(values: any) {
    return this.ask(this.hookTemplate(values), { type: "markdown", mode: "hook", temperature: 0.4, model: models.sonnet })
  }

  writeTemplate(values: any) {
    return `
    Headline: ${values?.title}
    Section heading prefix: ${values?.section?.prefix}
    Outline: ${values?.outline}
    Perspective: ${values?.section?.perspective}
    Related keywords: ${values?.section?.keywords}
    ${values?.section?.call_to_action ? `Call to action instructions:\n${values.section.call_to_action}` : ""}
    ${values?.section?.call_to_action && values?.section?.call_to_action_example ? `Call to action example:\n${values.section.call_to_action_example}` : ""}

    Primary instructions:
    - Write the section "${values?.section?.name}" with exactly ${values?.section?.word_count} words in markdown wrapped in \`\`\`markdown\`\`\`.
    - Leverage markdown syntaxes to make your content appealing and easier to read.
    - Add h3 sub-sections with ### if the content as more than 2 paragraphs.
    - Don't use h1 at all.
    - You know how to transition from a section to another at the end of a section.
    ${values?.section?.image?.alt && values?.section?.image?.href ? `- Include this image in the content: ![${values.section.image.alt}](${values.section.image.href})` : ""}

    ${values?.section?.custom_prompt ? `Secondary instructions (does not override primary instructions):\n${values?.section?.custom_prompt}` : ""}
    `
  }

  async write(values: any) {
    return this.ask(this.writeTemplate(values), { type: "markdown", mode: "write", word_count: values.word_count, temperature: 0.8, model: models.opus });
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
    - No adverbs at all
    - Simplify Words
    - Check for Hard-to-Read Phrases
    - Limit the Use of Passive Voice
    - Address Complex Sentences
    - Consider Sentence Variety
    - Readability Grade 9
    - Remove Redundancy

    Write in markdown wrapped in \`\`\`markdown\`\`\`.`
  }

  async rephrase(section: any) {
    return this.ask(`
    "${section}"

    ${this.rephraseTemplate(section)}
  `, { type: "markdown", mode: "rephrase", temperature: 0.3 });
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
  `, { type: "markdown", mode: "paraphrase" });
  }

  outlinePlanTemplate(values: any) {
    return `
    Outline:
    \`\`\`js
    ${JSON.stringify(values.outline.map((i: any) => ({ name: i.name, media: i.media })), null, 2)}
    \`\`\`

    Article word count: ${values.word_count}
    List of keywords to include (avoid keywords stuffing): ${values.keywords}

    Write an object for each section containing the information below (follow the typescript structure), return a json array.
    \`\`\`ts
    type Sections = {
      word_count: number;
      keywords: string; // comma separated
      image_search?: string; // search queries relevant to the heading to find stock photos
      youtube_search?: string; // search queries relevant to the heading to find youtube videos
    }[];
    type Plan = {
      meta_description: string;
      sections: Sections;
    }
    \`\`\`
    Wrap your output in \`\`\`json\`\`\`
    `
  }

  async outlinePlan(values: any) {
    return this.ask(this.outlinePlanTemplate(values), { type: "json", mode: "outline-plan", temperature: 0.3, model: models.opus });
  }
}