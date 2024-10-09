import { getUserId } from "@/helpers/user";
import { useEffect, useState } from "react";

const useUserId = () => {
  const [userId, setUserId] = useState();

  useEffect(() => {
    getUserId().then((value) => setUserId(value)).catch(console.error)
  }, []);

  return userId;
}

export default useUserId;