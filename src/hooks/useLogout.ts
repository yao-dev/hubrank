import supabase from '@/helpers/supabase/client';
import useSession from "@/hooks/useSession";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useLogout = () => {
  const queryClient = useQueryClient()
  const sessionStore = useSession();

  const logout = () => {
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

  return logout
}