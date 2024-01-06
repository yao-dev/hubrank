'use client';
import { useState } from "react";
import { useDisclosure } from '@mantine/hooks';
import { Modal, Group, Button, TextInput, Flex, Text, LoadingOverlay, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import useProjects from "@/hooks/useProjects";
import useProjectForm from "@/hooks/useProjectForm";
import useActiveProject from "@/hooks/useActiveProject";
import { useRouter } from "next/navigation";

const NewProjectModal = ({ opened, onClose }: any) => {
  const [loadingModal, { open: showLoadingModal, close: hideLoadingModal }] = useDisclosure(false);
  const [error, setError] = useState(false);
  const projects = useProjects();
  const form = useProjectForm();
  const activeProject = useActiveProject();
  const router = useRouter();


  const onCreateProject = form.onSubmit(async (values: any) => {
    setError(false)
    showLoadingModal()
    try {
      const { data: project } = await projects.create.mutateAsync(values);
      activeProject.setProjectId(project.id);
      router.push(`?tab=articles`);
      setTimeout(() => {
        onCloseNewProject()
      }, 2000);
    } catch {
      hideLoadingModal()
      setError(true)
    }
  });

  const onCloseNewProject = () => {
    onClose()
    setError(false)
    form.reset();
    hideLoadingModal()
  }

  return (
    <Modal opened={opened} onClose={onCloseNewProject} withCloseButton={false} trapFocus={false}>
      <LoadingOverlay visible={loadingModal} overlayProps={{ blur: 2 }} />
      <form onSubmit={onCreateProject}>
        <Flex direction="column" gap="md">
          <Text size="xl" fw="bold">New project</Text>
          {error && (
            <Alert icon={<IconAlertCircle size="1rem" />} title="Bummer!" color="red" variant="filled">
              Something went wrong! Try again please.
            </Alert>
          )}
          <TextInput
            withAsterisk
            label="Name"
            placeholder="Name"
            maxLength={50}
            {...form.getInputProps('name')}
          />
          <TextInput
            withAsterisk
            label="Website"
            placeholder="https://google.com"
            maxLength={50}
            {...form.getInputProps('website')}
          />
          {/* <Textarea
            withAsterisk
            label="Description"
            placeholder="Description"
            maxLength={500}
            minRows={3}
            maxRows={6}
            {...form.getInputProps('description')}
          /> */}
          {/* <Textarea
            withAsterisk
            label="Target audience"
            placeholder="Who is your ideal customer"
            maxLength={150}
            minRows={2}
            maxRows={4}
            {...form.getInputProps('target_audience')}
          /> */}

          <Group justify="flex-end" mt="md">
            <Button type="submit">Create</Button>
          </Group>
        </Flex>
      </form>
    </Modal>
  )
}

export default NewProjectModal;