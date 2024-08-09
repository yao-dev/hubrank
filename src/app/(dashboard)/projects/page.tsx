'use client';;
import { useRouter } from "next/navigation";
import useProjectId from "@/hooks/useProjectId";
import { Flex, Modal } from "antd";
import ProjectSelect from "@/components/ProjectSelect";
import Label from "@/components/Label/Label";
import { useEffect } from "react";

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
      <Modal
        open
        centered
        footer={null}
        width="auto"
      >
        <ProjectSelect
          label={<Label name="Select a project" />}
        />
      </Modal>
    </Flex>
  )
}
