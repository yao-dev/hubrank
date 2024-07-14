import { create } from "zustand";

type State = {
  isOpen: boolean;
  title?: string;
  subtitle?: string
};

type Action = {
  open: (isOpen: boolean, opts?: { title?: string; subtitle?: string }) => void;
};

const open = (
  isOpen: boolean,
  opts?: { title?: string; subtitle?: string }
): {
  isOpen: boolean;
  title: string;
  subtitle: string
} => {
  return {
    isOpen,
    title: opts?.title ?? "",
    subtitle: opts?.subtitle ?? "",
  };
};

const usePricingModal = create<State & Action>(
  (set) => ({
    isOpen: false,
    open: (isOpen: boolean, opts?: { title?: string; subtitle?: string }) =>
      set(() => open(isOpen, opts)),
  })
);

export default usePricingModal;
