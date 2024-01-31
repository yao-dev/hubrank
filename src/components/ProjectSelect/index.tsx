import useProjectId from "@/hooks/useProjectId";
import useProjects from "@/hooks/useProjects";
import { Button, Divider, Flex, Select } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { SettingOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { PlusOutlined } from '@ant-design/icons';
import NewProjectModal from "../NewProjectModal";

const ProjectSelect = () => {
  const projectId = useProjectId();
  const { getAll } = useProjects()
  const { data: projects } = getAll();
  const router = useRouter();
  const pathname = usePathname();
  const isSettingsPage = pathname.includes("/settings")
  const [openedCreateProject, setOpenCreateProject] = useState(false);

  const selectedProject = useMemo(() => {
    const foundProject = projects?.find((p) => {
      return p.id === projectId
    });

    if (foundProject) {
      return {
        label: foundProject.name,
        value: foundProject.id.toString()
      }
    }

    return null
  }, [projects, projectId])

  if (!projects?.length) {
    return null
  }

  return (
    <Flex align="center" justify="space-between" style={{ width: '100%', paddingRight: 24 }}>
      <NewProjectModal opened={openedCreateProject} onClose={() => setOpenCreateProject(false)} />

      <Select
        placeholder="Select a project"
        style={{ width: 200 }}
        value={selectedProject}
        onChange={(value) => {
          if (value !== null) {
            router.push(`/projects/${value}`);
          }
        }}
        options={projects?.map((p) => {
          return {
            label: p.name,
            value: p.id.toString()
          }
        })}
        dropdownRender={(menu) => (
          <>
            {menu}
            <Divider style={{ margin: '8px 0' }} />
            <Button type="text" block icon={<PlusOutlined />} onClick={() => setOpenCreateProject(true)}>
              New project
            </Button>
          </>
        )}
      />
      {projectId && !isSettingsPage ? (
        <Button icon={<SettingOutlined />} onClick={() => router.push(`/projects/${projectId}/settings`)}>Settings</Button>
      ) : null}
      {projectId && isSettingsPage ? (
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>Back to project</Button>
      ) : null}
    </Flex>
  )
}

export default ProjectSelect