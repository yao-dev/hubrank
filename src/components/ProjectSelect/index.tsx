import useProjectId from "@/hooks/useProjectId";
import useProjects from "@/hooks/useProjects";
import { IconSettings, IconTrash } from "@tabler/icons-react";
import { Flex, Popconfirm, Select } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

const ProjectSelect = () => {
  const projectId = useProjectId();
  const { getAll, delete: deleteProject } = useProjects()
  const { data: projects } = getAll();
  const router = useRouter();

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
      />
      {projectId ? (
        <Flex gap="small" align="center">
          <Link href={`/projects/${projectId}/settings`} style={{ display: "flex", color: 'black' }}>
            <IconSettings size="1.4rem" stroke={1.5} />
          </Link>
          <Popconfirm
            title="Delete project"
            description={`Are you sure to delete ${selectedProject?.label || "this project"}?`}
            onConfirm={(e) => {
              e?.preventDefault()
              deleteProject.mutate(projectId)
            }}
            onCancel={(e) => {
              e?.preventDefault()
            }}
            okText="Yes"
            cancelText="No"
          >
            <IconTrash style={{ cursor: "pointer" }} onClick={(e) => e.preventDefault()} size="1.4rem" stroke={1.5} />
          </Popconfirm>
        </Flex>
      ) : null}
    </Flex>
  )
}

export default ProjectSelect