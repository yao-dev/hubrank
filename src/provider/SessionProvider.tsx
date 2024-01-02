import SessionContext from "@/context/SessionContext";
import supabase from "@/helpers/supabase";
import useResetApp from "@/hooks/useResetApp";
import useSession from "@/hooks/useSession";
import React, { ReactNode, useState } from "react";

const SessionProvider = ({ children }: { children: (value: any) => ReactNode }) => {
  const sessionStore = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const resetApp = useResetApp();

  React.useEffect(() => {
    setIsLoading(true)
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        sessionStore.setSession(session);
        if (!session) {
          resetApp();
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  React.useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      sessionStore.setSession(session);
      if (!session) {
        resetApp();
      }
    })

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <SessionContext.Provider value={{ session: sessionStore.session }}>
      {children(sessionStore.session)}
    </SessionContext.Provider>
  );
};

export default SessionProvider;
