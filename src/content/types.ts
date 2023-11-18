type SectionType = 'topic_definition' | 'introduction' | 'section' | 'summary'

type SubSection = {
  type: 'sub_section';
  title: string;
  content: string[];
}

type ContentSection = {
  type: 'section';
  title: string;
  content: SubSection[] | string[];
}

type TableOfContent = {
  type: 'table_of_content';
  links: {
    name: string;
    anchor: string;
    content_type: SectionType;
    content_description: string; // one-line description of the section content
    sub_links?: {
      name: string;
      anchor: string;
      content_type: 'sub_section';
      content_description: string; // one-line description of the section content
    }
  }[]
};

// Keeping the same formating write a one-line summary for each item of the table of content

type TopicDefinition = string;

type Intro = {
  type: 'intro',
  content: string[];
}

type Summary = {
  type: 'summary',
  content: string[];
}

export type BlogPost = {
  headline: string;
  table_of_content: TableOfContent;
  topic_definition?: TopicDefinition;
  intro: Intro;
  sections: ContentSection[];
  summary: Summary;
};

type Instruction = {
  title: string;
  description?: string;
  steps: string[];
}

type HowToSection = {
  type: 'how_to_section';
  title: string;
  content: Instruction[] | string[];
}

type HowToList = {
  type: 'how_to_list';
  name: string;
  anchor: string;
  instructions: Instruction[];
}[];

type Overview = {
  type: 'overview',
  content: string[];
}

type ToolsNeeded = {
  type: 'tools_needed',
  content: string[];
}

type Tips = {
  type: 'tips',
  content: string[];
}

export type HowToGuide = {
  headline: string;
  how_to_list: HowToList;
  overview: Overview;
  tools_needed?: ToolsNeeded;
  sections: HowToSection[];
  tips?: Tips;
};

type ListicleItemType = {
  title: string;
  description: string;
  imageUrl?: string;
}

type ListicleIntro = {
  type: 'intro',
  content: string[];
}

type ListicleOutro = {
  type: 'outro',
  content: string[];
}

export type Listicles = {
  headline: string;
  intro: ListicleIntro;
  items: ListicleItemType[];
  outro: ListicleOutro;
};