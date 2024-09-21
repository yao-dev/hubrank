import supabase from "@/helpers/supabase/client";
import { useQuery } from "@tanstack/react-query";
import useUser from "./useUser";
import { isEmpty } from "lodash";
import queryKeys from "@/helpers/queryKeys";
import useActiveProject from "./useActiveProject";

const useIntegrations = () => {
  const user = useUser();
  const { id } = useActiveProject();

  return useQuery({
    enabled: !!user?.id,
    queryKey: queryKeys.integrations,
    queryFn: async () => {
      const { data } = await supabase.from("integrations").select("*").match({ user_id: user.id, project_id: +id, enabled: true })
      return data
    },
    select(data) {
      return isEmpty(data) ? [] : data
    }
  });
}

export default useIntegrations;