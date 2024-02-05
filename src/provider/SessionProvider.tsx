import SessionContext from "@/context/SessionContext";
import supabase from "@/helpers/supabase";
import useSession from "@/hooks/useSession";
import { useRouter } from "next/navigation";
import React, { ReactNode, useEffect } from "react";

const SessionProvider = ({ children }: { children: (value: any) => ReactNode }) => {
  const sessionStore = useSession();
  const router = useRouter();

  React.useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        sessionStore.setSession(null);
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
      } else {
        sessionStore.setSession(session);
      }
    })

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!sessionStore.session) {
      router.replace('/');
    }
  }, [sessionStore.session])

  return (
    <SessionContext.Provider value={{ session: sessionStore.session }}>
      {children(sessionStore.session)}
    </SessionContext.Provider>
  );
};

export default SessionProvider;
