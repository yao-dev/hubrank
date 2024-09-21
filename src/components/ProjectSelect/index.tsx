import useProjects from "@/hooks/useProjects";
import { Button, Divider, Image, Select } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PlusOutlined } from '@ant-design/icons';
import NewProjectModal from "../NewProjectModal";
import useUser from "@/hooks/useUser";
import usePricingModal from "@/hooks/usePricingModal";
import useActiveProject from "@/hooks/useActiveProject";

const ProjectSelect = (props = {}) => {
  // const projectId = useProjectId();
  const { getAll } = useProjects()
  const { data: projects } = getAll();
  const router = useRouter();
  const [openedCreateProject, setOpenCreateProject] = useState(false);
  const pathname = usePathname();
  const user = useUser();
  const pricingModal = usePricingModal();
  const { id: projectId, setProjectId } = useActiveProject()

  const hasReachedLimit = projects && user?.subscription?.projects_limit <= projects?.length;

  const onOpenNewProject = () => {
    if (hasReachedLimit) {
      pricingModal.open(true, {
        title: "You've reached your projects limit",
        subtitle: "Upgrade to create more projects"
      })
    } else {
      setOpenCreateProject(true)
    }
  }

  const selectedProject = useMemo(() => {
    const foundProject = projects?.find((p) => {
      return p.id === +projectId
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
            setProjectId(value)
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
                  {renderProjectFavicon(p.website)}
                  <span style={{ position: "relative", left: 10 }}>{p.name}</span>
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
              {projects?.length < 5 && (
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