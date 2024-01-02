import {
  Session as SupabaseSession,
} from "@supabase/supabase-js";
import { create } from "zustand";
import { persist } from 'zustand/middleware';

type Session = SupabaseSession | null;

type State = {
  session: Session;
};

type Action = {
  setSession: (session: Session) => void;
  signOut: () => void;
};

const initialState = {
  session: null,
  loading: false,
};

const setSession = (
  session: Session,
): {
  session: Session;
} => {
  return {
    session,
  };
};



const signOut = () => initialState;

const useSession = create<State & Action>(
  persist(
    (set) => ({
      ...initialState,
      setSession: (session: Session) =>
        set(() => setSession(session)),
      signOut: () => set(() => signOut()),
    }),
    {
      name: 'session', // name of the item in the storage (must be unique)
    },
  )
);

export default useSession;
