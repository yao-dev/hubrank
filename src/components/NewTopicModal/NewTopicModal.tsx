import { Modal, Group, Button, TextInput, LoadingOverlay, Flex, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import useTopicClusters from '@/hooks/useTopicClusters';
import useModal from '@/hooks/useModal';
import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const NewTopicModal = () => {
  const modal = useModal();
  const topicClusters = useTopicClusters();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter()
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const onClose = () => {
    const params = new URLSearchParams(searchParams)
    if (params.get("tab") === "topics") {
      params.delete("mode");
    }
    router.push(`${pathname}?${params.toString()}`)
    modal.close("create_topic");
    setIsLoading(false);
    form?.reset?.()
  }

  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    if (!params.has("mode")) {
      onClose()
    }
  }, [searchParams])

  const form = useForm({
    initialValues: {
      name: '',
    },
    validate: {
      name: (value: string) => !value || value.trim().length > 50 ? 'Name must be 50 characters or less' : null,
    }
  });

  const onCreateTopic = form.onSubmit(async (values: any) => {
    setIsLoading(true)
    try {
      await topicClusters.create.mutateAsync(values.name);
      onClose();
    } catch {
      setIsLoading(false)
      return;
    }
  })



  return (
    <Modal opened={modal.create_topic} onClose={isLoading ? () => { } : onClose} withCloseButton={false} trapFocus={false}>
      <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2 }} />
      <form onSubmit={onCreateTopic}>
        <Flex direction="column" gap="md">
          <Text size="xl" fw="bold">New topic cluster</Text>
          {/* <Select
            label="Project"
            placeholder="Select a project"
            withAsterisk
            disabled={!!activeProjectId}
            data={projects?.map((project) => ({
              label: project.name,
              value: project.id.toString()
            })) || []}
            {...form.getInputProps('project_id')}
          /> */}
          <TextInput
            label="Name"
            placeholder="Name"
            withAsterisk
            {...form.getInputProps('name')}
          />
          <Group justify="flex-end" mt="md">
            <Button type="submit" loading={isLoading}>Save</Button>
          </Group>
        </Flex>
      </form>
    </Modal>
  )
}

export default NewTopicModal