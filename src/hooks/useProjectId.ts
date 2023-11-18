import { useParams } from "next/navigation";

const useProjectId = () => {
  const params = useParams();
  return +(params.project_id as string)
}

export default useProjectId