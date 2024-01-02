'use client';
import React, { useCallback, useState } from "react";
import { Button, Flex, Text, Skeleton, Pagination, Image, Grid, Affix, Box } from '@mantine/core';
import { IconCheck, IconEye, IconPlus, IconX } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { IconTrash } from '@tabler/icons-react';
import useTopicClusters from "@/hooks/useTopicClusters";
import NewTopicModal from "../NewTopicModal/NewTopicModal";
import EditTopicModal from "../EditTopicModal/EditTopicModal";
import { notifications } from "@mantine/notifications";
import TopicClusterFilters from "../TopicClusterFilters/TopicClusterFilters";
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { modals } from "@mantine/modals";

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
  const router = useRouter();
  const params = useSearchParams();
  const tab = params.get("tab")

  const renderPagination = useCallback(() => {
    return (
      <Pagination value={filters.page} onChange={(page) => setFilters(prev => ({ ...prev, page }))} total={Math.ceil((data?.count || 1) / 25)} />
    )
  }, [filters.page, data?.count]);

  const editTopicForm = useForm({
    initialValues: {
      name: '',
    },
    validate: {
      name: (value) => !value || value.trim().length > 50 ? 'Name must be 50 characters or less' : null,
    }
  });

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

  const onDeleteTopic = (topicId: number, topicName: string) => {
    modals.openConfirmModal({
      title: <Text size="xl" fw="bold">Delete topic</Text>,
      withCloseButton: false,
      labels: {
        cancel: 'Cancel',
        confirm: 'Confirm'
      },
      async onConfirm() {
        try {
          notifications.show({
            id: 'delete_topic',
            message: 'Deleting topic.',
            loading: true,
            withCloseButton: false,
            autoClose: false,
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
      },
      confirmProps: {
        color: 'red'
      },
      children: (
        <Text size="sm">Are you sure you want to delete <b>{topicName}</b>? All articles attached to this topic will be deleted with it.</Text>
      )
    })
  }

  // const onDeleteTopic = async (topicId: number) => {
  //   try {
  //     notifications.show({
  //       id: 'delete_topic',
  //       message: 'Deleting topic cluster.',
  //       loading: true,
  //       withCloseButton: false,
  //       autoClose: false,
  //       color: 'blue',
  //     })
  //     await topicClusters.delete.mutateAsync(topicId)
  //     notifications.update({
  //       id: 'delete_topic',
  //       message: 'Topic deleted.',
  //       color: 'green',
  //       loading: false,
  //       icon: <IconCheck size="1rem" />,
  //       autoClose: 3000,
  //     })
  //   } catch (e) {
  //     notifications.update({
  //       id: 'delete_topic',
  //       message: 'We couldn\'nt delete the topic, please try again.',
  //       color: 'red',
  //       icon: <IconX size="1rem" />,
  //       autoClose: 3000,
  //     })
  //   }
  // }

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

  if (tab !== "topics") {
    return null;
  }

  return (
    <>
      <NewTopicModal />

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
          // justify="space-between"
          align="center"
          direction="row"
          mb="xl"
          gap="sm"
        >
          <TopicClusterFilters onChange={setFilters} onClear={() => setFilters(defaultFilters)} />
          {!!data?.data?.length && <Button onClick={() => router.push("?tab=topics&mode=create")} rightSection={<IconPlus />}>New topic</Button>}
        </Flex>


        {!isLoading && !data?.data?.length && (
          <Flex direction="column" h={460} justify="center" align="center" gap={50}>
            <Image
              w={500}
              src="/image-2.png"
            />
            <Button onClick={() => router.push("?tab=topics&mode=create")} rightSection={<IconPlus />}>New topic</Button>
          </Flex>
        )}

        {isLoading ? [...Array(10).keys()].map((i) => {
          return <Skeleton key={i} height={52} mb={12} radius="sm" />
        }) : (
          <Box pb={56}>
            {data?.data?.map((topic, index) => {
              const url = new URL(`${window.location.origin}?tab=articles&topic=${topic.id}`);
              url.searchParams.delete('query');
              url.searchParams.delete('status');
              return (
                <Grid key={topic.id} dir="row" mb="xs">
                  <Grid.Col span={3}>
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
                  </Grid.Col>
                  <Grid.Col span={2}>
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
                        <IconEye size={20} />
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
                          onDeleteTopic(topic.id, topic.name)
                        }}
                        color="red"
                        size="xs"
                        style={{
                          padding: '0 2.5px',
                          marginRight: 0
                        }}
                      >
                        <IconTrash size={20} />
                      </Button>
                    </Flex>
                  </Grid.Col>
                </Grid>
              )
            })}
          </Box>
        )}

        <Affix position={{ right: 0, bottom: 0, left: 300 }} style={{ background: "#FFF", borderTop: '1px solid #dee2e6' }}>
          <Flex
            align="center"
            justify="end"
            p="md"
            gap="md"
          >
            {renderPagination()}
          </Flex>
        </Affix>
      </div>
    </>
  )
}