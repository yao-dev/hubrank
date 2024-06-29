import useProjectId from "@/hooks/useProjectId";
import useProjects from "@/hooks/useProjects";
import { Button, Divider, Flex, Image, Select } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PlusOutlined } from '@ant-design/icons';
import NewProjectModal from "../NewProjectModal";

const ProjectSelect = () => {
  const projectId = useProjectId();
  const { getAll } = useProjects()
  const { data: projects } = getAll();
  const router = useRouter();
  const [openedCreateProject, setOpenCreateProject] = useState(false);
  const pathname = usePathname();

  console.log({ pathname })

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
            const newPath = pathname.replace(`${projectId}`, `${value}`)
            router.push(newPath);
          }
        }}
        options={projects?.map((p) => {
          return {
            label: (
              <Flex gap={10} align="center">
                <Image
                  src={`https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${p.website}&size=128`}
                  width={20}
                  height={20}
                  preview={false}
                  className="relative bottom-10"
                />
                <span>{p.name}</span>
              </Flex>
            ),
            value: p.id.toString(),
            website: p.website
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