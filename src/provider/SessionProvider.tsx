import SessionContext from "@/context/SessionContext";
import { stripeUrls } from "@/features/payment/constants";
import queryKeys from "@/helpers/queryKeys";
import supabase from "@/helpers/supabase";
import useSession from "@/hooks/useSession";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ReactNode, useEffect } from "react";

const SessionProvider = ({ children }: { children: ReactNode }) => {
  const sessionStore = useSession();
  const queryClient = useQueryClient()

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
        axios.post(stripeUrls.CREATE_CUSTOMER, { user_id: session?.user.id }).then()
        sessionStore.setSession(session);
        queryClient.invalidateQueries({
          queryKey: queryKeys.user()
        });
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
