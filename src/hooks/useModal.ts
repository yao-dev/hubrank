import { create } from "zustand";

type State = {
  create_project: boolean;
  create_audience: boolean;
  create_topic: boolean;
  create_competitor: boolean;
};

type ModalNames = keyof State

type Action = {
  open: (name: ModalNames) => void;
  close: (name: ModalNames) => void;
};

const initialState = {
  create_project: false,
  create_audience: false,
  create_topic: false,
  create_competitor: false,
}

const open = (
  name: ModalNames,
): {
  [key: string]: boolean;
} => {
  return {
    [name]: true
  };
};

const close = (
  name: ModalNames,
): {
  [key: string]: boolean;
} => {
  return {
    [name]: false
  };
};

const useModal = create<State & Action>((set) => ({
  ...initialState,
  open: (name: ModalNames) =>
    set(() => open(name)),
  close: (name: ModalNames) =>
    set(() => close(name)),
}));

export default useModal;
