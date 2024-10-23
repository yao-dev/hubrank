import { create } from "zustand";

type BlogPostState = {
  isOpen: boolean;
  languageId?: number;
  seedKeyword?: string;
  headline?: string;
  slug?: string;
}

type CaptionState = {
  isOpen: boolean;
  languageId?: number;
}

type KnowledgeState = {
  isOpen: boolean;
}

type ExportBlogPostState = {
  isOpen: boolean;
}

type State = {
  blogPost: BlogPostState;
  caption: CaptionState;
  knowledge: KnowledgeState;
  exportBlogPost: ExportBlogPostState;
};

type Action = {
  openBlogPostDrawer: (data: BlogPostState) => void;
  openCaptionDrawer: (data: CaptionState) => void;
  openKnowledgeDrawer: (data: KnowledgeState) => void;
  openExportBlogPostDrawer: (data: ExportBlogPostState) => void;
};

const openBlogPostDrawer = (state: State, data: BlogPostState): State => {
  return {
    ...state,
    blogPost: {
      ...state.blogPost,
      isOpen: data.isOpen,
      languageId: data.languageId,
      seedKeyword: data.seedKeyword,
      headline: data.headline,
      slug: data.slug,
    }
  };
};

const openCaptionDrawer = (state: State, data: CaptionState): State => {
  return {
    ...state,
    caption: {
      ...state.caption,
      isOpen: data.isOpen,
    }
  };
};

const openKnowledgeDrawer = (state: State, data: KnowledgeState): State => {
  return {
    ...state,
    knowledge: {
      ...state.knowledge,
      isOpen: data.isOpen,
    }
  };
};

const openExportBlogPostDrawer = (state: State, data: ExportBlogPostState): State => {
  return {
    ...state,
    exportBlogPost: {
      ...state.exportBlogPost,
      isOpen: data.isOpen,
    }
  };
};

const useDrawers = create<State & Action>(
  (set) => ({
    blogPost: {
      isOpen: false,
      languageId: undefined,
      seedKeyword: "",
      headline: "",
      slug: "",
    },
    caption: {
      isOpen: false,
      languageId: undefined,
    },
    knowledge: {
      isOpen: false,
    },
    exportBlogPost: {
      isOpen: false,
    },
    openBlogPostDrawer: (data: BlogPostState) =>
      set((state) => openBlogPostDrawer(state, data)),
    openCaptionDrawer: (data: CaptionState) =>
      set((state) => openCaptionDrawer(state, data)),
    openKnowledgeDrawer: (data: KnowledgeState) =>
      set((state) => openKnowledgeDrawer(state, data)),
    openExportBlogPostDrawer: (data: ExportBlogPostState) =>
      set((state) => openExportBlogPostDrawer(state, data)),
  })
);

export default useDrawers;
