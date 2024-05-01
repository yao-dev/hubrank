import SessionContext from "@/context/SessionContext";
import supabase from "@/helpers/supabase";
import useSession from "@/hooks/useSession";
import { ReactNode, useEffect } from "react";

const SessionProvider = ({ children }: { children: ReactNode }) => {
  const sessionStore = useSession();

  useEffect(() => {
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

  return (
    <SessionContext.Provider value={{ session: sessionStore.session }}>
      {children}
    </SessionContext.Provider>
  );
};

export default SessionProvider;
