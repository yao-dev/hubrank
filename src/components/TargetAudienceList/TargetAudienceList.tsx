'use client';
import { Button, Flex, Text, Skeleton, Image, Grid, Pagination, Box, Affix } from '@mantine/core';
import { IconCheck, IconPlus, IconX } from '@tabler/icons-react';
import { IconTrash } from '@tabler/icons-react';
import { notifications } from "@mantine/notifications";
import { useRouter, useSearchParams } from 'next/navigation';
import { modals } from "@mantine/modals";
import useTargetAudiences from "@/hooks/useTargetAudiences";
import AudienceFilters from '../AudienceFilters/AudienceFilters';
import { useCallback, useState } from 'react';
import NewAudienceModal from '../NewAudienceModal/NewAudienceModal';

const defaultFilters = {
  query: '',
  page: 1,
}

export default function TargetAudienceList() {
  const targetAudiences = useTargetAudiences();
  const { data, isLoading, isError } = targetAudiences.getAll({ page: 1 });
  const [filters, setFilters] = useState(defaultFilters)
  const router = useRouter();
  const params = useSearchParams();
  const tab = params.get("tab");

  const renderPagination = useCallback(() => {
    return (
      <Pagination value={filters.page} onChange={(page) => setFilters(prev => ({ ...prev, page }))} total={Math.ceil((data?.count || 1) / 25)} />
    )
  }, [filters.page, data?.count]);

  const onDeleteAudience = (audienceId: number, name: string) => {
    modals.openConfirmModal({
      title: <Text size="xl" fw="bold">Delete audience</Text>,
      withCloseButton: false,
      labels: {
        cancel: 'Cancel',
        confirm: 'Confirm'
      },
      async onConfirm() {
        try {
          notifications.show({
            id: 'delete_audience',
            message: 'Deleting audience.',
            loading: true,
            withCloseButton: false,
            autoClose: false,
          })
          await targetAudiences.delete.mutateAsync(audienceId)
          notifications.update({
            id: 'delete_audience',
            message: 'Audience deleted.',
            color: 'green',
            loading: false,
            icon: <IconCheck size="1rem" />,
            autoClose: 3000,
          })
        } catch (e) {
          notifications.update({
            id: 'delete_audience',
            message: 'We couldn\'nt delete the audience, please try again.',
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
        <Text size="sm">Are you sure you want to delete the following audience <b>{name}</b>?</Text>
      )
    })
  }

  if (isError) {
    return null;
  }

  if (tab !== "audiences") return null

  return (
    <>
      <NewAudienceModal />

      <div>
        <Flex
          // justify="space-between"
          align="center"
          direction="row"
          mb="xl"
          gap="sm"
        >
          <AudienceFilters onChange={setFilters} onClear={() => setFilters(defaultFilters)} />
          {!!data?.data?.length && <Button onClick={() => router.push("?tab=audiences&mode=create")} rightSection={<IconPlus />}>New audience</Button>}
        </Flex>

        {!isLoading && !data?.data?.length && (
          <Flex direction="column" h={460} justify="center" align="center" gap={50}>
            <Image
              w={500}
              src="/image-2.png"
            />
            <Button onClick={() => router.push("?tab=audiences&mode=create")} rightSection={<IconPlus />}>New audience</Button>
          </Flex>
        )}

        {isLoading ? [...Array(10).keys()].map((i) => {
          return <Skeleton key={i} height={35} mb={10} radius="sm" />
        }) : (
          <Box pb={56}>
            {data?.data?.map((audience) => {
              return (
                <Grid key={audience.id} dir="row" mb="xs">
                  <Grid.Col span={3}>
                    <Flex direction="row" align="center" gap="md">
                      <Text size="sm">{audience.audience}</Text>
                    </Flex>
                  </Grid.Col>
                  <Grid.Col span={2}>
                    <Flex align="center">
                      <Button
                        variant="transparent"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteAudience(audience.id, audience.audience)
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

        {!!data?.data?.length && (
          <Affix position={{ right: 0, bottom: 0, left: 300 }} style={{ background: "#FFF", borderTop: '1px solid #dee2e6' }}>
            <Flex
              justify="end"
              p="md"
            >
              {renderPagination()}
            </Flex>
          </Affix>
        )}
      </div>
    </>
  )
}