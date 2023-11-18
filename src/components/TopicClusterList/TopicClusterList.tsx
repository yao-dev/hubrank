'use client';
import styles from './style.module.css';
import React, { useCallback, useState } from "react";
import { Button, Flex, Text, Skeleton, Pagination, Card } from '@mantine/core';
import { IconCheck, IconEye, IconX } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { IconTrash } from '@tabler/icons-react';
import useTopicClusters from "@/hooks/useTopicClusters";
import NewTopicModal from "../NewTopicModal/NewTopicModal";
import EditTopicModal from "../EditTopicModal/EditTopicModal";
import { notifications } from "@mantine/notifications";
import TopicClusterFilters from "../TopicClusterFilters/TopicClusterFilters";
import useProjectId from '@/hooks/useProjectId';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const defaultFilters = {
  query: '',
  page: 1,
}

export default function TopicClusterList() {
  const [modalMode, setModalMode] = useState('');
  const [loadingModal, setLoadingModal] = useState('');
  const topicClusters = useTopicClusters();
  const [selectedTopic, setSelectedTopicCluster] = useState<any>();
  const [error, setError] = useState(false);
  const [filters, setFilters] = useState(defaultFilters)
  const { data, isLoading, isError } = useTopicClusters().getAll(filters);
  const activeProjectId = useProjectId();
  const router = useRouter()

  const renderPagination = useCallback(() => {
    return (
      <Pagination value={filters.page} onChange={(page) => setFilters(prev => ({ ...prev, page }))} total={Math.ceil((data?.count || 1) / 25)} />
    )
  }, [filters.page, data?.count])

  const newTopicForm = useForm({
    initialValues: {
      project_id: activeProjectId.toString(),
      name: '',
    },
    validate: {
      name: (value: string) => !value || value.trim().length > 50 ? 'Name must be 50 characters or less' : null,
    }
  });

  const editTopicForm = useForm({
    initialValues: {
      name: '',
    },
    validate: {
      name: (value) => !value || value.trim().length > 50 ? 'Name must be 50 characters or less' : null,
    }
  });

  const onCreateTopic = newTopicForm.onSubmit(async (values) => {
    setError(false)
    setLoadingModal('NEW_TOPIC')
    try {
      const result = await topicClusters.create.mutateAsync(values);
      setModalMode('')
      setLoadingModal('')
      newTopicForm.reset()
      router.push(`${window.location.pathname}/topic-clusters/${result?.data?.id}`)
    } catch {
      setLoadingModal('')
      setError(true)
      return;
    }
  })

  const onEditTopic = editTopicForm.onSubmit((values) => {
    setError(false)
    setLoadingModal('EDIT_TOPIC')
    try {
      topicClusters.update.mutate({
        ...values,
        topic_cluster_id: selectedTopic?.id,
      })
      onCloseModal(editTopicForm)
    } catch {
      setLoadingModal('')
      setError(true)
      return;
    }
  })

  const onDeleteTopic = async (topicId: number) => {
    try {
      notifications.show({
        id: 'delete_topic',
        message: 'Deleting topic cluster.',
        loading: true,
        withCloseButton: false,
        autoClose: false,
        color: 'blue',
      })
      await topicClusters.delete.mutateAsync(topicId)
      notifications.update({
        id: 'delete_topic',
        message: 'Topic deleted.',
        color: 'green',
        loading: false,
        icon: <IconCheck size="1rem" />,
        autoClose: 3000,
      })
    } catch (e) {
      notifications.update({
        id: 'delete_topic',
        message: 'We couldn\'nt delete the topic, please try again.',
        color: 'red',
        icon: <IconX size="1rem" />,
        autoClose: 3000,
      })
    }
  }

  const onOpenModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, mode: string) => {
    e?.stopPropagation?.();
    setError(false);
    setModalMode(mode)
  }

  const onCloseModal = (form?: any) => {
    setModalMode('')
    setError(false);
    setSelectedTopicCluster(null)
    form?.reset?.()
    setLoadingModal('')
  }

  if (isError) {
    return null;
  }

  return (
    <>
      <NewTopicModal
        opened={modalMode === 'NEW_TOPIC'}
        onClose={() => onCloseModal(newTopicForm)}
        isLoading={loadingModal === 'NEW_TOPIC'}
        onSubmit={onCreateTopic}
        form={newTopicForm}
        error={error}
      />

      <EditTopicModal
        opened={modalMode === 'EDIT_TOPIC'}
        onClose={() => onCloseModal(editTopicForm)}
        isLoading={loadingModal === 'EDIT_TOPIC'}
        onSubmit={onEditTopic}
        form={editTopicForm}
        error={error}
      />

      <div>
        <Flex
          justify="space-between"
          align="center"
          direction="row"
          mb="xl"
        >
          <TopicClusterFilters onChange={setFilters} onClear={() => setFilters(defaultFilters)} />
          <Button onClick={(e) => onOpenModal(e, 'NEW_TOPIC')}>New topic cluster</Button>
        </Flex>

        {isLoading ? [...Array(10).keys()].map(() => {
          return <Skeleton height={52} mb={12} radius="sm" />
        }) : data?.data?.map((topic, index) => {
          const url = new URL(`${window.location.href}/topic-cluster/${topic.id}`);
          url.searchParams.delete('query');
          url.searchParams.delete('status');
          return (
            <Card
              key={topic.id}
              shadow="none"
              padding="xs"
              radius="sm"
              mb="xs"
              withBorder
              w="100%"
              className={styles.row}
            >
              <Flex align="center" justify="space-between">
                <Link
                  prefetch={false}
                  href={url}
                  style={{
                    textDecoration: 'none',
                    color: 'black',
                  }}
                >
                  <Flex direction="row" justify="space-between" align="center">
                    <Flex direction="row" align="center" gap="md">
                      <Text fw="bold">{topic.name}</Text>
                      <Text fz="sm">{topic.articles?.length || 0} {`article${topic.articles?.length > 1 ? 's' : ''}`}</Text>
                    </Flex>
                  </Flex>
                </Link>
                <Flex align="center">
                  <Button
                    component={Link}
                    prefetch={false}
                    href={url}
                    variant="transparent"
                    size="xs"
                    style={{
                      padding: '0 2.5px',
                      // marginLeft: 5,
                      marginRight: 5
                    }}
                  >
                    <IconEye size={18} />
                  </Button>
                  {/* <Button
                    variant="transparent"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTopicCluster(topic);
                      editTopicForm.setFieldValue('name', topic.name)
                      onOpenModal(e, 'EDIT_TOPIC')
                    }}
                    size="xs"
                    style={{
                      padding: '0 2.5px',
                      marginRight: 0
                    }}
                  >
                    <IconPencil size={18} />
                  </Button> */}
                  <Button
                    variant="transparent"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTopic(topic.id)
                    }}
                    color="red"
                    size="xs"
                    style={{
                      padding: '0 2.5px',
                      marginRight: 0
                    }}
                  >
                    <IconTrash size={18} />
                  </Button>
                </Flex>
              </Flex>
            </Card>
          )
        })}

        <Flex
          justify="end"
          align="center"
          direction="row"
          mt="xl"
          mb="lg"
        >
          {renderPagination()}
        </Flex>
      </div>
    </>
  )
}