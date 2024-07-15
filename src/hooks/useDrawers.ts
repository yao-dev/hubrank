import { create } from "zustand";

type BlogPostState = {
  isOpen: boolean;
  languageId?: number;
  seedKeyword?: string;
}

type captionState = {
  isOpen: boolean;
  languageId?: number;
}

type knowledgeState = {
  isOpen: boolean;
}

type State = {
  blogPost: BlogPostState;
  caption: captionState;
  knowledge: knowledgeState;
};

type Action = {
  openBlogPostDrawer: (data: BlogPostState) => void;
  openCaptionDrawer: (data: captionState) => void;
  openKnowledgeDrawer: (data: knowledgeState) => void;
};

const openBlogPostDrawer = (state: State, data: BlogPostState): State => {
  return {
    ...state,
    blogPost: {
      ...state.blogPost,
      isOpen: data.isOpen,
      languageId: data.languageId,
      seedKeyword: data.seedKeyword,
    }
  };
};

const openCaptionDrawer = (state: State, data: captionState): State => {
  return {
    ...state,
    caption: {
      ...state.caption,
      isOpen: data.isOpen,
    }
  };
};

const openKnowledgeDrawer = (state: State, data: knowledgeState): State => {
  return {
    ...state,
    knowledge: {
      ...state.knowledge,
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
    },
    caption: {
      isOpen: false,
      languageId: undefined,
    },
    knowledge: {
      isOpen: false,
    },
    openBlogPostDrawer: (data: BlogPostState) =>
      set((state) => openBlogPostDrawer(state, data)),
    openCaptionDrawer: (data: captionState) =>
      set((state) => openCaptionDrawer(state, data)),
    openKnowledgeDrawer: (data: knowledgeState) =>
      set((state) => openKnowledgeDrawer(state, data)),
  })
);

export default useDrawers;
