"use client";;
import queryKeys from "@/helpers/queryKeys";
import supabase from '@/helpers/supabase/client';
import useSession from "@/hooks/useSession";
import { useQueryClient } from "@tanstack/react-query";
import { ReactNode, useEffect } from "react";

const SessionProvider = ({ children }: { children: ReactNode }) => {
  const sessionStore = useSession();
  const queryClient = useQueryClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== 'SIGNED_OUT') {
        sessionStore.setSession(session);
        queryClient.invalidateQueries({
          queryKey: queryKeys.user()
        });
        if (window.$crisp) {
          $crisp.push(["set", "user:email", [session?.user.email]]);
        }
      }
    })

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return children
};

export default SessionProvider;
