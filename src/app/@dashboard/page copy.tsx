'use client'

import { useState } from "react";
import { useDisclosure } from '@mantine/hooks';
import { Modal, Group, Button, TextInput, Flex, Card, Text, LoadingOverlay, Alert, ActionIcon, Title, Textarea, Image, Grid } from '@mantine/core';
import { IconAlertCircle, IconPlus, IconSettings } from '@tabler/icons-react';
import { useRouter } from "next/navigation";
import useProjects from "@/hooks/useProjects";
import Link from "next/link";
import useProjectForm from "@/hooks/useProjectForm";

const NewProject = () => {
  const [opened, { open: openCreateProject, close: closeCreateProject }] = useDisclosure(false);
  const [loadingModal, { open: showLoadingModal, close: hideLoadingModal }] = useDisclosure(false);
  const [error, setError] = useState(false);
  const router = useRouter()
  const projects = useProjects();
  const form = useProjectForm();

  const onCreateProject = form.onSubmit(async (values) => {
    setError(false)
    showLoadingModal()
    try {
      const { data: project } = await projects.create.mutateAsync(values);
      router.push(`/projects/${project.id}`)
    } catch {
      hideLoadingModal()
      setError(true)
    }
  });

  const onCloseNewProject = () => {
    closeCreateProject()
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
          <Textarea
            withAsterisk
            label="Target audience"
            placeholder="Who is your ideal customer"
            maxLength={150}
            minRows={2}
            maxRows={4}
            {...form.getInputProps('target_audience')}
          />

          <Group justify="flex-end" mt="md">
            <Button type="submit">Create</Button>
          </Group>
        </Flex>
      </form>
    </Modal>
  )
}


export default function ProjectList() {
  const [opened, { open: openCreateProject, close: closeCreateProject }] = useDisclosure(false);
  const [loadingModal, { open: showLoadingModal, close: hideLoadingModal }] = useDisclosure(false);
  const [error, setError] = useState(false);
  const router = useRouter()
  const projects = useProjects();
  const {
    data: projectList,
    isLoading,
    isError
  } = projects.getAll();
  const form = useProjectForm();

  const onCreateProject = form.onSubmit(async (values) => {
    setError(false)
    showLoadingModal()
    try {
      const { data: project } = await projects.create.mutateAsync(values);
      router.push(`/projects/${project.id}`)
    } catch {
      hideLoadingModal()
      setError(true)
    }
  });


  const onCloseNewProject = () => {
    closeCreateProject()
    setError(false)
    form.reset();
    hideLoadingModal()
  }

  if (isError) {
    return null;
  }

  if (isLoading) {
    // TODO: show skeleton
    return null;
  }

  return (
    <div>
      {/* NEW PROJECT MODAL */}
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
            <Textarea
              withAsterisk
              label="Target audience"
              placeholder="Who is your ideal customer"
              maxLength={150}
              minRows={2}
              maxRows={4}
              {...form.getInputProps('target_audience')}
            />

            <Group justify="flex-end" mt="md">
              <Button type="submit">Create</Button>
            </Group>
          </Flex>
        </form>
      </Modal>

      <div>
        <Flex
          // mih={50}
          gap="md"
          justify="space-between"
          align="center"
          direction="row"
          // wrap="wrap"
          mb="lg"
        >
          <Title order={2}>Projects</Title>
          <Button onClick={openCreateProject} rightSection={<IconPlus size="1rem" />}>New project</Button>
        </Flex>

        <Grid>
          {projectList?.map((project) => {
            let description = project?.metatags?.description || "No description.";
            description = description.length > 125 ? `${description.slice(0, 125)}...` : description

            return (
              <Grid.Col key={project.id} span={4}>
                <Card
                  component={Link}
                  prefetch={false}
                  href={`/projects/${project.id}`}
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  mih={180}
                  mah={180}
                  style={{ cursor: 'pointer' }}
                >
                  <Flex direction="row" justify="space-between">
                    <Flex direction="row" gap="md" align="center" mb="md">
                      <Image
                        src={`https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${project.website}&size=128`}
                        width={128 / 3}
                        height={128 / 3}
                        alt={project.name}
                      />
                      <Text size="xl" fw={700}>{project.name}</Text>
                    </Flex>

                    <ActionIcon
                      component={Link}
                      prefetch={false}
                      href={`/projects/${project.id}/settings`}
                      variant="transparent"
                      color="dark"
                    >
                      <IconSettings size="1.5rem" />
                    </ActionIcon>
                  </Flex>

                  <Text size="sm" color="dimmed">
                    {description}
                  </Text>
                </Card>
              </Grid.Col>
            )
          })}
        </Grid>
      </div>
    </div>
  );
}
