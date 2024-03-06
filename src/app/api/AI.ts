import Anthropic from "@anthropic-ai/sdk";
import yaml from 'js-yaml';
import { getSummary } from 'readability-cyr';

type Opts = {
  context?: string,
  writing_style?: string
}

export class AI {
  messages: any = [];
  system = "";
  article = "";
  ai: any;
  writing_style = "";

  constructor(opts: Opts = {}) {
    this.ai = new Anthropic({
      apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY, // defaults to process.env["ANTHROPIC_API_KEY"]
    });
    this.system = `You are an expert SEO writer who writes using Hemingway principles and writes engaging content that speak to the right target audience.

    ${opts.context ? `Product/Project information:\n${opts.context}\n====\n` : ""}`;

    this.writing_style = opts.writing_style ?? "";

    console.log("[AI]: system", this.system)
  }

  resetPrompt() {
    console.log("[AI]: reset prompt")
    this.messages = [];
  }

  parse(text: string, contentType: string = "") {
    if (text.indexOf("@@@") !== -1) {
      return text.slice(text.indexOf("@@@") + 3, text.lastIndexOf("@@@"));
    }

    let content = text;
    const marker = "```" + contentType;

    if (["json", "yml", "yaml"].includes(contentType)) {
      content = text.slice(text.indexOf(marker) + marker.length, text.lastIndexOf("```"));

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

  async ask(prompt: any, opts: any = {}) {
    console.log(`[AI]: ${opts.mode || "ask"}`);

    const start = performance.now();

    // this.messages.push({
    //   role: "user",
    //   content: prompt
    // });

    const completion = await this.ai.beta.messages.create({
      // model: "claude-2.1",
      // model: opts.model || "claude-3-sonnet-20",
      model: "claude-3-sonnet-20240229",
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

    const end = performance.now();

    console.log(`[AI]: duration: ${(end - start) / 1000}`);

    // this.messages.push({
    //   role: "assistant",
    //   content: completion.content[0].text
    // });

    return this.parse(completion.content[0].text, opts.type)
  }

  headlinesTemplate(values: any) {
    // Write the headlines wrapped within triple @@@.

    const prefix = values.isInspo ? `headline inspo: ${values.inspo_title}` : `List of competitors headline ranking in the SERP for the keyword "${values.seedKeyword}":
    ${values.competitorsHeadlines.join('\n- ')}`

    if (values.writingStyle) {
      return `${prefix}

      Give me 10 unique and SEO friendly headlines made for the search intent "${values.seedKeyword}"
      - your purpose is ${values.purpose}
      - the content type is "${values.contentType}"
      ${values.clickbait ? "- make it clickbait" : ""}
      - one headline per line
      - do not add any text formatting

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
    return this.ask(this.headlinesTemplate(values), { mode: "headlines", temperature: 0.5, model: "claude-2.1" });
  }

  titleTemplate({ competitorsHeadlines, seedKeyword, tone, contentType, purpose, clickbait }: any) {
    return `List of competitors headline ranking in the SERP for the keyword "${seedKeyword}"
    ${competitorsHeadlines.join('\n- ')}

    Write a unique and SEO friendly headline made for the search intent "${seedKeyword}"
    - your tone is ${tone}
    - your purpose is ${purpose}
    - the content type is "${contentType}"
    ${clickbait ? "- the headline is a clickbait" : ""}
    - write in markdown wrapped in \`\`\`markdown\`\`\`
    `
  }

  async title(values: any) {
    return this.ask(this.titleTemplate(values), { type: "markdown", mode: "title", temperature: 0.5, model: "claude-2.1" });
  }

  outlineIdeaTemplate(values: any) {
    return `Write an outline for: "${values.title}"
    - the outline must have ${values.heading_count} sections
    - ${values.introduction ? "add an introduction" : "do not add an introduction"}
    - ${values.conclusion ? "add a conclusion/summary" : "do not add a conclusion"}
    - ${values.key_takeways ? "add a key takeways" : "do not add a key takeways"}
    - ${values.faq ? "add a FAQ" : "do not add a FAQ"}
    - list of keywords to choose from to include in the section titles: ${values.keywords}
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
    return this.ask(this.outlineIdeaTemplate(values), { type: "json", mode: "outlines", temperature: 0.7, model: "claude-2.1" });
  }

  // outlineIdeaTemplate(values: any) {
  //   return `Write an article outline for: "${values.title}"
  //   - the article must have ${values.heading_count} sections (excluding sub-sections)
  //   - a sub-section is optional
  //   - ${values.introduction ? "add an introduction (it never has sub-sections)" : "do not add an introduction"}
  //   - ${values.conclusion ? "add a conclusion/summary (it never has sub-sections)" : "do not add a conclusion"}
  //   - ${values.key_takeways ? "add a key takeways (it never has sub-sections)" : "do not add a key takeways"}
  //   - ${values.faq ? "add a FAQ" : "do not add a FAQ"}
  //   - list of keywords to choose from to include in the section titles: ${values.keywords}
  //   - Language: ${values.language}

  //   Wrap the outline in a well formated JSON array wrapped in \`\`\`json\`\`\` follow the structure shown below
  //   \`\`\`json
  //   [
  //     {
  //       name: "section name 1",
  //       sub_sections: [
  //         {
  //           name: "sub-section name 1,
  //         }
  //         {
  //           name: "sub-section name 2,
  //         }
  //       ]
  //     },
  //     {
  //       name: "section name 2",
  //     },
  //     {
  //       name: "section name 3",
  //     },
  //   ]
  //   \`\`\`
  //   `
  // }

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
    return this.ask(this.outlineTemplate(values), { type: "yaml", mode: "outline", temperature: 0.7, model: "claude-2.1" });
  }

  hookTemplate(values: any) {
    return `
    Outline: ${values?.outline}
    Seed keyword: ${values?.seed_keyword}
    perspective: ${values?.perspective}

    Write a hook (typically ranging from one to three sentences or around 20-50 words) for the article "${values?.title}"
    write in markdown wrapped in \`\`\`markdown\`\`\`. (don't add any text before and after the markdown except the text I request you to write)`
  }

  async hook(values: any) {
    return this.ask(this.hookTemplate(values), { type: "markdown", mode: "hook", temperature: 0.6, model: "claude-2.1" })
  }

  writeTemplate(values: any) {
    return `
    Headline: ${values?.title}
    Section prefix: ${values?.heading_prefix}
    Outline: ${values?.outline}
    Perspective: ${values?.perspective}
    Related keywords: ${values?.keywords}
    ${this.writing_style && `Writing style: ${this.writing_style}`}

    wrap keywords semantically and topically relevant for internal/external link with %%
    Write the section "${values?.heading}" with exactly ${values?.word_count} words in markdown wrapped in \`\`\`markdown\`\`\`.
    - Leverage all markdown syntaxes to make your content more appealing and easier to read (bold, list, quote, table, etc.).
    - Add h3 sub-sections with ### if the content as more than 2 paragraphs
    `
  }

  async write(values: any) {
    return this.ask(`
    ${this.writeTemplate(values)}
  `, { type: "markdown", mode: "write", word_count: values.word_count });
  }

  expandTemplate() {
    return `${this.writing_style && `Writing style: ${this.writing_style}`}

    Expand the text above by 50 to 150 words, write in markdown wrapped in \`\`\`markdown\`\`\`.
    (don't add any text before and after the markdown except the text I request you to write)`
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

    ${this.writing_style && `Writing style: ${this.writing_style}`}

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

    Write in markdown wrapped in \`\`\`markdown\`\`\`. (don't add any text before and after the markdown except the text I request you to write)`
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

    Write in markdown wrapped in \`\`\`markdown\`\`\`. (don't add any text before and after the markdown except the text I request you to write)`
  }

  async paraphrase(section: any, writingStyle: any) {
    return this.ask(`
    "${section}"

    ${this.paraphraseTemplate(writingStyle)}
  `, { type: "markdown", mode: "paraphrase" });
  }

  outlineWithWordCountTemplate(values: any) {
    return `
    \`\`\`json
    ${values.outline}
    \`\`\`

    This is an outline for an article of ${values.word_count} words.
    Write the word count of each sections alongside the keywords to include in that section in an array like the example below.

    \`\`\`json
    [
      {
        word_count: 300,
        keywords: "keyword a, keyword b, etc.."
      }
    ]
    \`\`\`
    `
  }

  async sectionsWordCount(values: any) {
    return this.ask(this.outlineWithWordCountTemplate(values), { type: "json", mode: "sections-word-count", temperature: 0, model: "claude-2.1" });
  }
}