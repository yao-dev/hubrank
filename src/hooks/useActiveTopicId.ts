import { useParams } from "next/navigation";

const useActiveTopicId = () => {
  const params = useParams();
  return +(params.topic_cluster_id as string)
}

export default useActiveTopicId