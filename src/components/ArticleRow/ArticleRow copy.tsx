'use client';;
import styles from './style.module.css';
import { Button, Flex, Text, Badge, Skeleton } from '@mantine/core';
import { IconCheck, IconEye, IconPencil, IconTrash, IconX } from '@tabler/icons-react';
import { notifications } from "@mantine/notifications";
import useArticles from "@/hooks/useArticles";
import Link from "next/link";
import useArticleSettings from "@/hooks/useArticleSettings";
import { modals } from '@mantine/modals';
import useTopicClusters from '@/hooks/useTopicClusters';
import { contentTypes, purposes } from '../WriteArticleModal/options';
import { useMemo } from 'react';

type ArticleRowProps = {
  id: number;
}

const ArticleRow = ({ id }: ArticleRowProps) => {
  const articles = useArticles();
  const { data: article, isLoading } = articles.getOne(id);
  const { data: topic } = useTopicClusters().getOne(article?.topic_cluster_id)
  const articleSettings = useArticleSettings({ article })

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
        <Text size="sm">Are you sure you want to delete <b>{article.title}</b>?</Text>
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

  if (isLoading) {
    return (
      <Skeleton height={52} mb={12} radius="sm" />
    )
  }

  const href = `${window.location.pathname}/articles/${article.id}`

  return (
    <>
      {articleSettings.modal()}
      <Flex
        direction="row"
        justify="space-between"
        align="center"
        // mb="xs"
        className={styles.wrapper}
      >
        <Link
          prefetch={false}
          href={href}
          style={{
            textDecoration: 'none',
            color: 'black',
            cursor: 'pointer'
          }}
        >
          <Flex direction="row" align="center" gap="sm" pl="md">
            <Flex direction="column">
              <Text size="sm">{article.title}</Text>
              <Flex direction="row" gap="xs" mt="xs">
                <Badge size="xs" variant="light" color="grape">Words: {article.word_count || 0}</Badge>
                {article.content_type && contentType && <Badge variant="light" size="xs" color="violet">{contentType}</Badge>}
                {article.purpose && purpose && <Badge variant="light" size="xs" color="pink">{purpose}</Badge>}
                {article.keyword && <Badge variant="light" size="xs" color="teal">{article.keyword}</Badge>}
                {topic?.name && <Badge variant="light" size="xs" color="blue">{topic.name}</Badge>}
              </Flex>
            </Flex>
          </Flex>
        </Link>
        <Flex direction="row" align="center">
          {article.status && <Badge size="sm" variant="dot" color={getStatusColor(article.status)}>{formatStatus(article.status)}</Badge>}
          <Button
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
          </Button>
          <Button
            variant="transparent"
            onClick={(e) => {
              e.stopPropagation();
              articleSettings.open();
            }}
            size="xs"
            style={{
              padding: '0 2.5px',
              marginRight: 5
            }}
          >
            <IconPencil size={18} />
          </Button>
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
      </Flex>
    </>
  )
}

export default ArticleRow;