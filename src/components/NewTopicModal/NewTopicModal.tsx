import { Modal, Group, Button, TextInput, LoadingOverlay, Select, Flex, Text } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import useProjects from "@/hooks/useProjects";
import useProjectId from "@/hooks/useProjectId";

type NewTopicModalProps = {
  opened: boolean;
  isLoading: boolean;
  error: boolean;
  onClose: () => void;
  onSubmit: () => void;
  form: UseFormReturnType<{
    project_id: number;
    name: string;
  }, (values: {
    project_id: number;
    name: string;
  }) => {
    project_id: number;
    name: string;
  }>
}

const NewTopicModal = ({
  opened,
  onClose,
  isLoading,
  onSubmit,
  form
}: NewTopicModalProps) => {
  const projectId = useProjectId()
  const { data: projects } = useProjects().getAll({ enabled: opened });

  return (
    <Modal opened={opened} onClose={isLoading ? () => { } : onClose} withCloseButton={false} trapFocus={false}>
      <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2 }} />
      <form onSubmit={onSubmit}>
        <Flex direction="column" gap="md">
          <Text size="xl" fw="bold">New topic cluster</Text>
          <Select
            label="Project"
            placeholder="Select a project"
            withAsterisk
            disabled={!!projectId}
            data={projects?.map((project) => ({
              label: project.name,
              value: project.id.toString()
            })) || []}
            {...form.getInputProps('project_id')}
          />
          <TextInput
            label="Name"
            placeholder="Name"
            withAsterisk
            {...form.getInputProps('name')}
          />
          <Group justify="flex-end" mt="md">
            <Button type="submit">Save</Button>
          </Group>
        </Flex>
      </form>
    </Modal>
  )
}

export default NewTopicModal