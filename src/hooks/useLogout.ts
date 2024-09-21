import supabase from '@/helpers/supabase/client';
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from 'next/navigation';

export const useLogout = () => {
  const queryClient = useQueryClient()
  const router = useRouter()

  const logout = () => {
    supabase.auth.signOut()
      .then(() => {
        router.push("/login");
      })
      .then(() => {
        queryClient.clear();
      })
  }

  return logout
}