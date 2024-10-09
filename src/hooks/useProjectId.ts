// const useProjectId = () => {
//   const params = useParams();
//   return +(params.project_id as string)
// }

import { usePathname } from "next/navigation";
import { useMemo } from "react";

const useProjectId = () => {
  const pathname = usePathname();
  const projectId = useMemo(() => pathname.split('/').slice(2, 3)?.[0], [pathname]);

  return projectId ? +projectId : null
}

export default useProjectId