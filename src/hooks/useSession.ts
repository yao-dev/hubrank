import {
  Session as SupabaseSession,
} from "@supabase/supabase-js";
import { create } from "zustand";

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

const useSession = create<State & Action>((set) => ({
  ...initialState,
  setSession: (session: Session) =>
    set(() => setSession(session)),
  signOut: () => set(() => signOut()),
}));

export default useSession;
