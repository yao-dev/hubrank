// const useProjectId = () => {
//   const params = useParams();
//   return +(params.project_id as string)
// }

import { usePathname } from "next/navigation";
import { useMemo } from "react";

const useProjectId = () => {
  const pathname = usePathname();
  const projectId = useMemo(() => pathname.split('/').slice(2, 3)?.[0], [pathname]);

  if (isNaN(+projectId)) {
    return 0
  }
  return +projectId
}

export default useProjectId