'use client';;
import { Button, Flex, Text, Badge, Skeleton, Grid } from '@mantine/core';
import { IconCheck, IconPencil, IconTrash, IconX } from '@tabler/icons-react';
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import { modals } from '@mantine/modals';
import { contentTypes, purposes } from '../WriteArticleModal/options';
import { useMemo } from 'react';
import useBlogPosts from '@/hooks/useBlogPosts';
import supabase from '@/helpers/supabase';

type ArticleRowProps = {
  id: number;
}

const ArticleRow = ({ id }: ArticleRowProps) => {
  const articles = useBlogPosts();
  const { data: article, isLoading } = articles.getOne(id);
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
            message: 'Deleting article.',
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
        <Text size="sm">Are you sure you want to delete <b>{article.headline}</b>?</Text>
      )
    })
  }

  const formatStatus = (status: string) => {
    return `${status[0].toUpperCase()}${status.replaceAll('_', ' ').slice(1).toLowerCase()}`
  }

  const purpose = useMemo(() => purposes.find((i: any) => i.value === article?.purpose)?.label, [article])
  const contentType = useMemo(() => contentTypes.find((i: any) => i.value === article?.content_type)?.label, [article])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting_to_be_written':
        return 'dark';
      case 'writing_queue':
        return 'orange';
      case 'writing':
        return 'blue';
      case 'draft':
        return 'dark';
      case 'error':
        return 'red';
      case 'complete':
      case 'published':
        return 'green';
      default:
        return 'dark'
    }
  }

  const onRetry = async () => {
    await supabase.from('blog_posts_headings').delete().eq("blog_post_id", article.id).throwOnError();
    await supabase.from('blog_posts').update({ status: "writing" }).eq("id", article.id);
    await supabase.from('blog_posts_headings').insert(article.headings.map((h: any, hIdx: any) => {
      return {
        blog_post_id: article.id,
        heading: h.heading,
        words_count: h.words_count,
        media: h.media,
        call_to_action: h.call_to_action,
        call_to_action_instruction: h.call_to_action_instruction,
        keywords: h.keywords,
        external_links: h.external_links,
        order: hIdx,
      }
    }))
  }

  if (isLoading) {
    return (
      <Skeleton height={52} mb={12} radius="sm" />
    )
  }

  const href = `${window.location.pathname}/${article.id}`

  return (
    <Grid dir="row" mb="xs">
      {/* {articleSettings.modal()} */}
      <Grid.Col span="auto">
        <Link
          prefetch={false}
          href={href}
          style={{
            textDecoration: 'none',
            color: 'black',
            cursor: 'pointer'
          }}
        >
          <Text size="sm" fw="">{article.headline}</Text>
        </Link>
      </Grid.Col>
      <Grid.Col span={4}>
        <Flex direction="row" gap="xs" mt="xs">
          {article.content_type && contentType && <Badge variant="light" size="xs" color="violet">{contentType}</Badge>}
          {article.purpose && purpose && <Badge variant="light" size="xs" color="pink">{purpose}</Badge>}
          {article.topic && <Badge variant="light" size="xs" color="teal">{article.topic}</Badge>}
        </Flex>
      </Grid.Col>
      <Grid.Col span={2}>
        <Flex direction="row" align="center" justify="flex-end">
          <Flex align="center" gap="xs">
            {article.status && <Badge size="sm" variant="dot" color={getStatusColor(article.status)}>{formatStatus(article.status)}</Badge>}
            {article.status === "error" && <Button onClick={onRetry} variant="light">retry</Button>}
          </Flex>
          {article.status !== "error" && (
            <>
              {/* <Button
                component={Link}
                prefetch={false}
                href={href}
                variant="transparent"
                // onClick={(e) => { e.stopPropagation() }}
                size="xs"
                style={{
                  padding: '0 2.5px',
                  marginLeft: 5,
                  marginRight: 5
                }}
              >
                <IconEye size={18} />
              </Button> */}
              {/* <Button
                component={Link}
                prefetch={false}
                href={href}
                variant="outline"
                // onClick={(e) => { e.stopPropagation() }}
                size="compact-md"
                style={{
                  // padding: '0 2.5px',
                  marginLeft: 5,
                  marginRight: 5
                }}
              >
                view
              </Button> */}
              <Button
                variant="transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  // articleSettings.open();
                }}
                size="xs"
                style={{
                  padding: '0 2.5px',
                  marginRight: 5
                }}
              >
                <IconPencil size={18} />
              </Button>
            </>
          )}
          <Button
            variant="transparent"
            onClick={(e) => {
              e.stopPropagation()
              onDeleteArticle(article.id)
            }}
            color="red"
            size="xs"
            mr="sm"
            style={{
              padding: '0 2.5px',
            }}
          >
            <IconTrash size={18} />
          </Button>
        </Flex>
      </Grid.Col>
    </Grid>
  )
}

export default ArticleRow;