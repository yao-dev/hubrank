import supabase from "@/helpers/supabase/client";
import { useQuery } from "@tanstack/react-query";
import useUser from "./useUser";
import { isEmpty } from "lodash";
import queryKeys from "@/helpers/queryKeys";
import useProjectId from "./useProjectId";

const useIntegrations = ({ enabled } = {}) => {
  const user = useUser();
  const projectId = useProjectId();

  return useQuery({
    enabled: !!user?.id && !!projectId,
    queryKey: queryKeys.integrations({ projectId, enabled }),
    queryFn: async () => {
      const options = { user_id: user.id, project_id: projectId }

      if (typeof enabled === "boolean") {
        options.enabled = enabled
      }

      const { data } = await supabase.from("integrations").select("*").match(options)
      return data
    },
    select(data) {
      return isEmpty(data) ? [] : data
    }
  });
}

export default useIntegrations;