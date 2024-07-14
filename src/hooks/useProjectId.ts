// const useProjectId = () => {
//   const params = useParams();
//   return +(params.project_id as string)
// }

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import useActiveProject from "./useActiveProject";

const useProjectId = () => {
  const pathname = usePathname();
  const projectId = useMemo(() => pathname.split('/').slice(2, 3)?.[0], [pathname]);
  const activeProject = useActiveProject();

  if (isNaN(+projectId)) {
    return activeProject.id
  }

  return +projectId
}

export default useProjectId