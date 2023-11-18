'use client';;
import ArticleList from "@/components/ArticleList/ArticleList";
import EditTopicModal from "@/components/EditTopicModal/EditTopicModal";
import MyBreadcrumbs from "@/components/MyBreadcrumbs/MyBreadcrumbs";
import useActiveTopicId from "@/hooks/useActiveTopicId";
import useProjectId from "@/hooks/useProjectId";
import useProjects from "@/hooks/useProjects";
import useTopicClusters from "@/hooks/useTopicClusters";
import { Button, Flex, Text, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function topicClusterDetailPage() {
  const projectId = useProjectId();
  const topicId = useActiveTopicId();
  const { data: project, isLoading: isProjectLoading, isError: isProjectError } = useProjects().getOne(projectId)
  const topicClusters = useTopicClusters();
  const { data: topic, isLoading: isTopicLoading, isError: isTopicError } = topicClusters.getOne(topicId)
  const router = useRouter();
  const [editModal, setEditModal] = useState({
    open: false,
    loading: false,
    error: false
  });

  const editTopicForm = useForm({
    initialValues: {
      name: topic?.name,
    },
    validate: {
      name: (value) => !value || value.trim().length > 50 ? 'Name must be 50 characters or less' : null,
    }
  });

  useEffect(() => {
    if (topic?.name && editTopicForm.values.name !== topic.name) {
      editTopicForm.setFieldValue('name', topic.name)
    }
  }, [topic])

  const onCloseEditModal = () => {
    setEditModal(prev => ({
      ...prev,
      open: false,
      loading: false
    }));
  }
  const onEditTopic = editTopicForm.onSubmit((values) => {
    setEditModal(prev => ({
      ...prev,
      error: false,
      loading: true
    }))
    try {
      topicClusters.update.mutate({
        ...values,
        topic_cluster_id: topicId,
      })
      onCloseEditModal();
    } catch {
      setEditModal(prev => ({
        ...prev,
        error: true,
        loading: false
      }))
      return;
    }
  })

  const onDeleteTopic = () => {
    modals.openConfirmModal({
      title: <Text size="xl" fw="bold">Delete topic cluster</Text>,
      withCloseButton: false,
      labels: {
        cancel: 'Cancel',
        confirm: 'Confirm'
      },
      onConfirm() {
        topicClusters.delete.mutate(topicId);
        notifications.show({
          title: 'All good!',
          message: 'Your topic was deleted.',
          color: 'green',
          icon: <IconCheck size="1rem" />
        })
        router.replace(`/projects/${projectId}`)
      },
      confirmProps: {
        color: 'red'
      },
      children: (
        <Text size="sm">Are you sure you want to delete <b>{topic?.name}</b>?</Text>
      )
    })
  }

  if (isProjectError || isTopicError) {
    return null
  }

  if (isProjectLoading || isTopicLoading) {
    return null
  }

  return (
    <>
      <EditTopicModal
        opened={editModal.open}
        onClose={() => onCloseEditModal()}
        isLoading={editModal.loading}
        onSubmit={onEditTopic}
        form={editTopicForm}
        error={editModal.error}
      />
      <Flex direction="row" align="center" justify="space-between" w="auto" gap="sm" mb="lg">
        <MyBreadcrumbs />
        {/* <Flex
          direction="row"
          align="center"
          w="auto"
          gap="sm"
          style={{ cursor: 'pointer' }}
          onClick={() => router.back()}
        >
          <IconArrowLeft />
          <Image
            src={`https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${project.website}&size=128`}
            width={128 / 5}
            height={128 / 5}
            alt={project.name}
          />
          <Text>{project.name}</Text>
        </Flex> */}

        <Flex align="center" gap="sm">
          <Button
            variant="outline"
            color="dark"
            onClick={() => setEditModal(prev => ({ ...prev, open: true }))}
          >
            Edit
          </Button>

          <Button variant='outline' color='red' onClick={onDeleteTopic}>
            Delete
          </Button>
        </Flex>
      </Flex>

      <Flex direction="row" gap="md" align="center" mb="xl">
        <Title order={2}>{topic?.name}</Title>
      </Flex>

      <ArticleList />
    </>
  )
}