import { create } from "zustand";
import { persist } from 'zustand/middleware';

type State = {
  id: number;
};

type Action = {
  setProjectId: (id: number) => void;
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
      id: 0,
      setProjectId: (id: number) =>
        set(() => setProjectId(id)),
    }),
    {
      name: 'active_project'
    }
  )
);

export default useActiveProject;
