"use client";;
import useProjects from "@/hooks/useProjects";
import { Button, Divider, Image, Select } from "antd";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PlusOutlined } from '@ant-design/icons';
import NewProjectModal from "../NewProjectModal";
import useProjectId from "@/hooks/useProjectId";

const ProjectSelect = (props = {}) => {
  const projectId = useProjectId();
  const { getAll } = useProjects()
  const { data: projects } = getAll();
  const router = useRouter();
  const [openedCreateProject, setOpenCreateProject] = useState(false);

  const onOpenNewProject = () => {
    setOpenCreateProject(true)
  }

  const selectedProject = useMemo(() => {
    const foundProject = projects?.find((p) => {
      return p.id === projectId
    });

    if (foundProject) {
      return {
        label: foundProject.name,
        value: foundProject.id.toString(),
        website: foundProject.website
      }
    }

    return null
  }, [projects, projectId]);

  const renderProjectFavicon = (website: string) => {
    return (
      <Image
        src={`https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${website}&size=128`}
        width={20}
        height={20}
        preview={false}
      />
    )
  }

  const suffixIcon = useMemo(() => {
    if (!selectedProject) return null
    return renderProjectFavicon(selectedProject.website)
  }, [selectedProject])

  return (
    <>
      <NewProjectModal opened={openedCreateProject} onClose={() => setOpenCreateProject(false)} />
      <div className="flex flex-col gap-2">
        {props.label && props.label}
        <Select
          placeholder="Select or create a project"
          style={{ width: 200 }}
          value={selectedProject}
          onChange={(value) => {
            if (projectId && value !== null) {
              const newPath = window.location.href.replace(`${projectId}`, `${value}`)
              router.push(newPath);
            } else if (!projectId) {
              const newPath = window.location.href.replace("/projects", `/projects/${value}?tab=blog-posts`)
              router.push(newPath);
            }
          }}
          options={projects?.map((p) => {
            return {
              label: (
                <>
                  <span className="relative top-1">
                    {renderProjectFavicon(p.website)}
                  </span>
                  <span style={{ position: "relative", left: 8 }}>{p.name}</span>
                </>
              ),
              value: p.id.toString(),
              website: p.website
            }
          })}
          suffixIcon={suffixIcon}
          dropdownRender={(menu) => (
            <>
              {menu}
              {projects?.length < 20 && (
                <>
                  <Divider style={{ margin: '8px 0' }} />
                  <Button type="text" block icon={<PlusOutlined />} onClick={onOpenNewProject}>
                    New project
                  </Button>
                </>
              )}
            </>
          )}
        />
      </div>
    </>
  )
}

export default ProjectSelect