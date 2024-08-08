import useSession from "@/hooks/useSession";
import { queryClient } from "./reactQuery";
import supabase from "./supabase";

export const logout = () => {
  const sessionStore = useSession();

  // clear local and session storage
  const storage = [
    window.localStorage,
    window.sessionStorage,
  ]

  storage.forEach((storage) => {
    Object.entries(storage)
      .forEach(([key]) => {
        storage.removeItem(key)
      })
  });

  sessionStore.setSession(null);
  queryClient.clear();
  supabase.auth.signOut().then();
}