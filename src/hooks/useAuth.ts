import { getUser } from "@/helpers/user";
import { useEffect, useState } from "react";

const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getUser().then((result) => setUser(result)).catch(console.error)
  }, []);

  return user;
}

export default useAuth;