import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // staleTime: 60 * 1000 * 60 * 24, // 23h
      // staleTime: Infinity,
      // gcTime: Infinity,
      gcTime: 60 * 1000 * 60 * 24, // 23h,
      refetchOnReconnect: "always",
      // refetchOnMount: true,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});