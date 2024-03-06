import useProjectId from "@/hooks/useProjectId";
import useProjects from "@/hooks/useProjects";
import { Button, Divider, Select } from "antd";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PlusOutlined } from '@ant-design/icons';
import NewProjectModal from "../NewProjectModal";

const ProjectSelect = () => {
  const projectId = useProjectId();
  const { getAll } = useProjects()
  const { data: projects } = getAll();
  const router = useRouter();
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
    <>
      <NewProjectModal opened={openedCreateProject} onClose={() => setOpenCreateProject(false)} />
      <Select
        placeholder="Select a project"
        style={{ width: 200 }}
        value={selectedProject}
        onChange={(value) => {
          if (value !== null) {
            router.push(`/projects/${value}/articles`);
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
    </>
  )
}

export default ProjectSelect