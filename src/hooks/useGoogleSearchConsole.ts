import { create } from "zustand";
import { persist } from 'zustand/middleware';

type State = {
  access_token: string;
};

type Action = {
  setAccessToken: (access_token: string) => void;
};

const setAccessToken = (
  access_token: string,
): {
  access_token: string;
} => {
  return {
    access_token,
  };
};

const useGoogleSearchConsole = create<State & Action>(
  persist(
    (set) => ({
      access_token: 0,
      setAccessToken: (access_token: string) =>
        set(() => setAccessToken(access_token)),
    }),
    {
      name: 'search_console'
    }
  )
);

export default useGoogleSearchConsole;
