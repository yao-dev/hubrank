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

type State = {
  blogPost: BlogPostState;
  caption: captionState;
};

type Action = {
  openBlogPostDrawer: (data: BlogPostState) => void;
  openCaptionDrawer: (data: captionState) => void;
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
    openBlogPostDrawer: (data: BlogPostState) =>
      set((state) => openBlogPostDrawer(state, data)),
    openCaptionDrawer: (data: captionState) =>
      set((state) => openCaptionDrawer(state, data)),
  })
);

export default useDrawers;
