import { useParams } from "next/navigation";

const useActiveArticleId = () => {
  const params = useParams();
  return +(params.article_id as string)
}

export default useActiveArticleId