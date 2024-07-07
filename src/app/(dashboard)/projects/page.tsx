'use client';;
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useProjectId from "@/hooks/useProjectId";
import { Flex, Typography } from "antd";
import ProjectSelect from "@/components/ProjectSelect";

export default function Projects() {
  const router = useRouter();
  const projectId = useProjectId();

  useEffect(() => {
    if (projectId) {
      router.push(`/projects/${projectId}?tab=blog-posts`);
    }
  }, [projectId]);

  return (
    <Flex vertical gap="middle" align="center" justify="center">
      <Typography.Title level={1}>Select or create a project</Typography.Title>
      <ProjectSelect />
    </Flex>
  )
}
