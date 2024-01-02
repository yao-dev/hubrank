import { Affix, Box, Button, Flex, Text, TextInput } from "@mantine/core";
import useProjects from "@/hooks/useProjects";
import useProjectForm from "@/hooks/useProjectForm";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import useActiveProject from "@/hooks/useActiveProject";
import HtmlHeadTagsForm from "../HtmlHeadTagsForm/HtmlHeadTagsForm";
import { useSearchParams } from "next/navigation";

const ProjectForm = () => {
  const activeProject = useActiveProject();
  const projectId = activeProject.id as number;
  const { getOne, update, delete: deleteProject } = useProjects()
  const { data: project } = getOne(projectId)
  const form = useProjectForm(project);
  const params = useSearchParams();
  const tab = params.get("tab")

  if (projectId === null || tab !== "settings") {
    return null;
  }

  const onDeleteProject = () => {
    modals.openConfirmModal({
      title: <Text size="xl" fw="bold">Delete project</Text>,
      withCloseButton: false,
      labels: {
        cancel: 'Cancel',
        confirm: 'Confirm'
      },
      onConfirm() {
        deleteProject.mutate(projectId);
        notifications.show({
          title: 'All good!',
          message: 'Your project was deleted.',
          color: 'green',
          icon: <IconCheck size="1rem" />
        })
        // router.replace('/projects')
      },
      confirmProps: {
        color: 'red'
      },
      children: (
        <Text size="sm">Are you sure you want to delete <b>{project?.name}</b>?</Text>
      )
    })
  }

  const onSubmit = form.onSubmit(async (values) => {
    try {
      await update.mutateAsync({
        ...values,
        project_id: projectId
      })
      notifications.show({
        message: 'Project updated.',
        color: 'green',
        icon: <IconCheck size="1rem" />
      })

    } catch (e) {
      console.error(e)
      notifications.show({
        message: 'Project not updated.',
        color: 'red',
        icon: <IconX size="1rem" />
      })
    }
  });

  const onTrain = () => {
    update.mutate({
      project_id: projectId,
      training: status === 'trained' ? 're-training' : 'training'
    });
    // setTimeout(() => {
    //   update.mutate({
    //     project_id: projectId,
    //     training: 'trained'
    //   });
    // }, 5000)
    // setTimeout(() => {
    //   update.mutate({
    //     project_id: projectId,
    //     training: null
    //   });
    // }, 10000)
  }

  const isTraining = ['re-training', 'training'].includes(project?.training || "")

  return (
    <form onSubmit={onSubmit}>
      <Box pb={72}>
        <Flex direction="column" gap="lg">
          <Flex direction="column" gap="md" mb="lg">
            <TextInput
              withAsterisk
              label="Name"
              placeholder="Name"
              maxLength={50}
              disabled={isTraining}
              {...form.getInputProps('name')}
            />
            <Flex direction="row" align="end" gap="md">
              <TextInput
                withAsterisk
                label="Website"
                placeholder="https://google.com"
                maxLength={50}
                disabled={isTraining}
                style={{ flex: 1 }}
                {...form.getInputProps('website')}
              />
              {/* <TrainButton
              display={project?.website === form.values.website}
              status={project?.training}
              onClick={() => isTraining ? undefined : onTrain()}
            /> */}
            </Flex>
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
            disabled={isTraining}
            {...form.getInputProps('target_audience')}
          /> */}
          </Flex>
        </Flex>

        <HtmlHeadTagsForm />
      </Box>

      <Affix position={{ right: 0, bottom: 0, left: 300 }} style={{ background: "#FFF", borderTop: '1px solid #dee2e6' }}>
        <Flex
          align="center"
          justify="end"
          p="md"
          gap="md"
        >
          <Button variant='outline' color='red' onClick={onDeleteProject}>
            Delete
          </Button>
          <Button type="submit" disabled={isTraining}>
            Save
          </Button>
        </Flex>
      </Affix>
    </form>
  );

}

export default ProjectForm;