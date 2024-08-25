import { create } from "zustand";
import { persist } from 'zustand/middleware';

type Id = number | null;

type State = {
  id: Id;
};

type Action = {
  setProjectId: (id: Id) => void;
};

const setProjectId = (
  id: number,
): {
  id: number;
} => {
  return {
    id,
  };
};

const useActiveProject = create<State & Action>(
  persist(
    (set) => ({
      id: null,
      setProjectId: (id: Id) =>
        set(() => setProjectId(id)),
    }),
    {
      name: 'active_project'
    }
  )
);

export default useActiveProject;
