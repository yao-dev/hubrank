import SessionContext from "@/context/SessionContext";
import supabase from "@/helpers/supabase";
import useResetApp from "@/hooks/useResetApp";
import useSession from "@/hooks/useSession";
import { useRouter } from "next/navigation";
import React, { ReactNode } from "react";

const SessionProvider = ({ children }: { children: (value: any) => ReactNode }) => {
  const sessionStore = useSession();
  const router = useRouter();
  const resetApp = useResetApp();

  React.useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        sessionStore.setSession(session);
        if (!session) {
          resetApp();
          router.replace('/')
        }
      })
  }, [])

  React.useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      sessionStore.setSession(session);
      if (!session) {
        resetApp();
        router.replace('/')
      }
    })

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <SessionContext.Provider value={{ session: sessionStore.session }}>
      {children(sessionStore.session)}
    </SessionContext.Provider>
  );
};

export default SessionProvider;
