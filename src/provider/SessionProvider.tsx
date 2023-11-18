import SessionContext from "@/context/SessionContext";
import supabase from "@/helpers/supabase";
import useSession from "@/hooks/useSession";
import React, { ReactNode } from "react";

const SessionProvider = ({ children }: { children: (value: any) => ReactNode }) => {
  const sessionStore = useSession();

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      sessionStore.setSession(session)
    })
  }, [])

  React.useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      sessionStore.setSession(session)
    });

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
