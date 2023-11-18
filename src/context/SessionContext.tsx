import { Session } from "@supabase/supabase-js";
import React from "react";

type SessionContextType = {
  session: Session | null;
};

const SessionContext = React.createContext<SessionContextType>({
  session: null,
});

export default SessionContext;
