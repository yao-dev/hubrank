import useActiveProject from "@/hooks/useActiveProject";
import useProjects from "@/hooks/useProjects";
import { Select } from "@mantine/core";
import { useRouter } from "next/navigation";

const ProjectSelect = () => {
  const activeProject = useActiveProject();
  const { data: projects } = useProjects().getAll();
  const router = useRouter();

  if (!projects?.length) {
    return null
  }

  return (
    <Select
      placeholder="Select a project"
      value={activeProject.id.toString() || ""}
      onChange={(value) => {
        if (value !== null) {
          activeProject.setProjectId(+value);
          router.push(`?tab=articles`);
        }
      }}
      data={projects?.map((p) => {
        return {
          label: p.name,
          value: p.id.toString()
        }
      })}
    />
  )
}

export default ProjectSelect