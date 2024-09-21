'use client';;
import { useRouter, useSearchParams } from "next/navigation";
import { Flex, Image, Modal, Spin } from "antd";
import ProjectSelect from "@/components/ProjectSelect";
import Label from "@/components/Label/Label";
import { useEffect, useState } from "react";
import useUser from "@/hooks/useUser";
import { brandsLogo } from "@/brands-logo";
import useProjects from "@/hooks/useProjects";
import useActiveProject from "@/hooks/useActiveProject";
import supabase from "@/helpers/supabase/client";
// import { useEffect } from "react";

export default function Projects() {
  const router = useRouter();
  const { id: projectId } = useActiveProject()
  const { data: project } = useProjects().getOne(+projectId)
  const [isMounting, setIsMounting] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIntegrationLoading, setIsIntegrationLoading] = useState(false);
  // const [hover, setHover] = useState("")
  // const [selectedIntegration, setSelectedIntegration] = useState("")
  const searchParams = useSearchParams();
  const user = useUser();

  useEffect(() => {
    setTimeout(() => {
      if (projectId) {
        if (searchParams.get("install_zapier")) {
          setIsModalOpen(true)
        } else {
          router.push(`/projects/${projectId}?tab=blog-posts`);
        }
      }
      setIsMounting(false);
    }, 1000)
  }, [project]);

  return (
    <Spin spinning={isMounting}>
      <Flex vertical gap="middle" align="center" justify="center">
        <Modal
          open={!isMounting && isModalOpen}
          centered
          closable={false}
          title="New integration"
          okText="Accept"
          maskClosable={false}
          onCancel={() => {
            router.push(`/projects/${projectId}?tab=blog-posts`)
          }}
          confirmLoading={isIntegrationLoading}
          onOk={async () => {
            setIsIntegrationLoading(true)
            const { data: newIntegration } = await supabase.from("integrations").insert({ user_id: user.id, project_id: projectId, platform: "zapier" }).select().maybeSingle()
            const query = {
              client_id: searchParams.get("client_id"),
              state: searchParams.get("state"),
              code: newIntegration.id
            };

            const urlEncoded = new URLSearchParams();
            if (query.client_id) urlEncoded.append('client_id', query.client_id);
            if (query.state) urlEncoded.append('state', query.state);
            urlEncoded.append('code', query.code);
            const redirectUrl = `${searchParams.get("redirect_uri")}?${urlEncoded.toString()}`;
            router.push(redirectUrl)
          }}
        >
          <p className='m-0 text-center'>
            <Image
              src={brandsLogo.zapier}
              height={50}
              preview={false}
            />
          </p>
          <p className='text-center text-base mt-6 mb-10'>Zapier is requesting access to {project ? <b>{project.name}</b> : "your Hubrank account"}</p>
        </Modal>

        <Modal
          open={!isMounting && !projectId}
          centered
          footer={null}
          width="auto"
          maskClosable={false}
        >
          <ProjectSelect
            label={<Label name="Select a project" />}
          />
        </Modal>
      </Flex>
    </Spin>
  )
}
