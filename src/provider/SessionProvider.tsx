"use client";;
import { SessionContext } from "@/context/SessionContext";
import queryKeys from "@/helpers/queryKeys";
import supabase from '@/helpers/supabase/client';
import useAuth from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { ReactNode, useEffect } from "react";

const SessionProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient()
  const user = useAuth();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== 'SIGNED_OUT') {
        queryClient.invalidateQueries({
          queryKey: queryKeys.user()
        });
        if (window.$crisp) {
          $crisp.push(["set", "user:email", [user?.email]]);
        }
      }
    })

    return () => {
      subscription?.unsubscribe();
    };
  }, [user]);

  return (
    <SessionContext.Provider value={{ user }}>
      {children}
    </SessionContext.Provider>
  )
};

export default SessionProvider;
