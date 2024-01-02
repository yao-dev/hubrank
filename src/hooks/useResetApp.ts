import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

const useResetApp = () => {
  const queryClient = useQueryClient();

  const resetApp = useCallback(() => {
    const stores = ["session", "active_project"];

    stores.forEach((store) => {
      localStorage.removeItem(store);
    });

    queryClient.clear();
  }, [])

  return resetApp
};

export default useResetApp;