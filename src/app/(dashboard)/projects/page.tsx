'use client';;
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useProjectId from "@/hooks/useProjectId";

export default function Projects() {
  const router = useRouter();
  const projectId = useProjectId();

  useEffect(() => {
    router.push(`/projects/${projectId}/articles`);
  }, [projectId]);

  return null
}
