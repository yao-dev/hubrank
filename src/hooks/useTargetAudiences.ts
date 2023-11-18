import supabase from "@/helpers/supabase";
import { useQuery } from "@tanstack/react-query";

const getAll = async () => {
  const { data } = await supabase.from('target_audience').select("*").limit(500);
  return data
}

const useGetAll = () => {
  return useQuery({
    queryKey: ['target_audience'],
    queryFn: () => getAll(),
  })
}

const useTargetAudiences = () => {
  return {
    getAll: useGetAll
  }
}

export default useTargetAudiences;