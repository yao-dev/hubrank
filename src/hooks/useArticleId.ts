import { useParams } from "next/navigation";

const useArticleId = () => {
  const params = useParams();
  return +(params.article_id as string)
}

export default useArticleId