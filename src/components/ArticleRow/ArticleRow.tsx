'use client';
import { Button, Flex, Text, Badge, Grid } from '@mantine/core';
import { IconCheck, IconTrash, IconX } from '@tabler/icons-react';
import { notifications } from "@mantine/notifications";
import { modals } from '@mantine/modals';
import { contentTypes, purposes } from '../WriteArticleModal/options';
import { useMemo } from 'react';
import useBlogPosts from '@/hooks/useBlogPosts';
import supabase from '@/helpers/supabase';
import { useRouter } from 'next/navigation';
import { getUserId } from '@/helpers/user';
import { useQueryClient } from "@tanstack/react-query";

type ArticleRowProps = {
  data: any;
}

const ArticleRow = ({ data }: ArticleRowProps) => {
  const articles = useBlogPosts();
  // const { data: article } = articles.getOne(data.id);
  const router = useRouter();
  const queryClient = useQueryClient();
  // const articleSettings = useArticleSettings({ article })

  const onDeleteArticle = (articleId: number) => {
    modals.openConfirmModal({
      title: <Text size="xl" fw="bold">Delete article</Text>,
      withCloseButton: false,
      labels: {
        cancel: 'Cancel',
        confirm: 'Confirm'
      },
      async onConfirm() {
        try {
          notifications.show({
            id: 'delete_article',
            message: 'Deleting data.',
            loading: true,
            withCloseButton: false,
            autoClose: false,
          })
          await articles.delete.mutateAsync(articleId)
          notifications.update({
            id: 'delete_article',
            message: 'Article deleted.',
            color: 'green',
            loading: false,
            icon: <IconCheck size="1rem" />,
            autoClose: 3000,
          })
        } catch (e) {
          notifications.update({
            id: 'delete_article',
            message: 'We couldn\'nt delete the article, please try again.',
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
        <Text size="sm">Are you sure you want to delete <b>{data?.headline || data.headline}</b>?</Text>
      )
    })
  }

  const onCreateEdit = (e: any) => {
    e.stopPropagation();
    // articleSettings.open();
    router.push(`?tab=articles&mode=create&article=${data.id}`)
  }

  const onViewEdit = () => {
    if (data?.markdown) {
      router.push(`?tab=articles&mode=edit&article=${data.id}`)
    }
  }

  const formatStatus = (status: string) => {
    return `${status[0].toUpperCase()}${status.replaceAll('_', ' ').slice(1).toLowerCase()}`
  }

  const purpose = useMemo(() => purposes.find((i: any) => i.value === data?.purpose)?.label, [data])
  const contentType = useMemo(() => contentTypes.find((i: any) => i.value === data?.content_type)?.label, [data])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting_to_be_written':
        return 'dark';
      case 'writing_queue':
        return 'orange';
      case 'writing':
        return 'blue';
      case 'saved_for_later':
        return 'orange';
      case 'draft':
        return 'dark';
      case 'error':
        return 'red';
      case 'ready_to_view':
      case 'complete':
      case 'completed':
      case 'published':
        return 'green';
      default:
        return 'dark'
    }
  }

  const onRetry = async () => {
    const user_id = await getUserId();
    await supabase.from('blog_posts_headings').delete().eq("blog_post_id", data.id).throwOnError();
    await supabase.from('blog_posts').update({ status: "writing" }).eq("id", data.id).throwOnError();
    queryClient.invalidateQueries({
      queryKey: ["blog_posts"],
    });
    await supabase.from('blog_posts_headings').insert(data.headings.map((h: any, hIdx: any) => {
      return {
        blog_post_id: data.id,
        heading: h.heading,
        words_count: h.words_count,
        media: h.media,
        call_to_action: h.call_to_action,
        call_to_action_instruction: h.call_to_action_instruction,
        keywords: h.keywords,
        external_links: h.external_links,
        order: hIdx,
        user_id
      }
    }))
      .throwOnError()
  }

  // if (isLoading) {
  //   return (
  //     <Skeleton height={52} mb={12} radius="sm" />
  //   )
  // }

  // const status = data?.status || data.status;
  const status = data?.status

  return (
    <Grid dir="row" mb="xs" onClick={onViewEdit} style={{ cursor: data?.markdown ? "pointer" : "not-allowed" }}>
      {/* {articleSettings.modal()} */}
      <Grid.Col span="auto">
        <Text size="sm" fw="">{data?.headline || data.headline}</Text>
      </Grid.Col>
      <Grid.Col span={4}>
        <Flex direction="row" gap="xs" mt="xs">
          {data.content_type && contentType && <Badge variant="light" size="xs" color="violet">{contentType}</Badge>}
          {data.purpose && purpose && <Badge variant="light" size="xs" color="pink">{purpose}</Badge>}
          {data.topic && <Badge variant="light" size="xs" color="teal">{data.topic}</Badge>}
        </Flex>
      </Grid.Col>
      <Grid.Col span={3}>
        <Flex direction="row" align="center" justify="flex-end">
          {status && <Badge size="sm" mr="sm" variant="dot" color={getStatusColor(status)}>{formatStatus(status)}</Badge>}
          {status === "error" && <Button onClick={onRetry} color="red" variant="outline" size="compact-xs" mr="sm">retry</Button>}
          <Button size="compact-xs" mr="sm" disabled={["error", "writing"].includes(data?.status) || data?.markdown} onClick={onCreateEdit}>edit</Button>
          <Button size="compact-xs" mr="sm" disabled={!data?.markdown} onClick={onViewEdit}>view</Button>
          <Button
            variant="transparent"
            onClick={(e) => {
              e.stopPropagation()
              onDeleteArticle(data.id)
            }}
            color="red"
            size="xs"
            mr="sm"
            style={{
              padding: '0 2.5px',
            }}
          >
            <IconTrash size={20} />
          </Button>
        </Flex>
      </Grid.Col>
    </Grid>
  )
}

export default ArticleRow;