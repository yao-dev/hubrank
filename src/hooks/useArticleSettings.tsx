'use client';
import { useEffect, useState } from "react";
import { IconCheck, IconX } from '@tabler/icons-react';
import { notifications } from "@mantine/notifications";
import useArticles from "@/hooks/useArticles";
import { useForm } from "@mantine/form";
import useProjectId from "./useProjectId";
import WriteArticleModal from "@/components/WriteArticleModal/WriteArticleModal";
import { contentTypes, purposes } from "@/components/WriteArticleModal/options";
import { urlRegex } from "@/constants";

type UseArticleSettings = {
  article?: any;
}

const useArticleSettings = ({ article }: UseArticleSettings = {}) => {
  const articles = useArticles();
  const [show, setShow] = useState(false);
  const activeProjectId = useProjectId();

  const form = useForm({
    initialValues: {
      article_id: article?.id,
      headline: article?.title || "",
      word_count: article?.word_count || 500,
      purpose: !article?.purpose ? "" : purposes.find(i => i.label === article.purpose)?.value,
      content_type: !article?.content_type ? "" : contentTypes.find(i => i.label === article.content_type)?.value,
      additional_info: article?.additional_info || "",
      project_id: activeProjectId,
      topic_cluster_id: article?.topic_cluster_id?.toString(),
      write_on_save: false,
      tones: article?.tones || [],
      resource_urls: article?.resource_urls || ""
    },
    validate: {
      headline: (value) => !value || !value.trim().length ? 'Please enter a headline' : null,
      word_count: (value) => (value < 500 || value > 4000) ? 'Enter a value between 500 and 4000' : null,
      purpose: (value) => !value ? 'Select a purpose' : null,
      content_type: (value) => !value ? 'Select a content type' : null,
      tones: (value) => !value?.length ? 'Select a tone' : null,
      topic_cluster_id: (value) => !value ? 'Please select a topic' : null,
      resource_urls: (value) => {
        if (!value) return null;
        return !value.split('\n').every(i => urlRegex.test(i)) ? 'Please enter valid urls' : null;
      }
    },
  });

  useEffect(() => {
    form.setValues({
      article_id: article?.id,
      headline: article?.title || "",
      word_count: article?.word_count || 500,
      purpose: !article?.purpose ? "" : purposes.find(i => i.value === article.purpose)?.value,
      content_type: !article?.content_type ? "" : contentTypes.find(i => i.value === article.content_type)?.value,
      additional_info: article?.additional_info || "",
      project_id: activeProjectId,
      topic_cluster_id: article?.topic_cluster_id?.toString(),
      write_on_save: false,
      tones: article?.tones || [],
      resource_urls: article?.resource_urls || ""
    })
  }, [article, activeProjectId])

  const onSubmit = form.onSubmit((values: any) => {
    try {
      notifications.show({
        message: values.write_on_save ? 'Article added in queue.' : `Article ${values.article_id ? 'updated' : 'created'}`,
        color: 'green',
        icon: <IconCheck size="1rem" />,
      })

      articles.write.mutate(values)
      onCloseModal()
    } catch {
      notifications.show({
        message: 'Something went wrong, please try again.',
        color: 'red',
        icon: <IconX size="1rem" />,
      })
    }
  })

  const onOpenModal = () => {
    setShow(true);
  }

  const onCloseModal = () => {
    setShow(false);
    form.reset();
  }

  return {
    open: onOpenModal,
    form,
    modal: () => show && (
      <WriteArticleModal
        opened={show}
        onClose={onCloseModal}
        onSubmit={onSubmit}
        form={form}
      />
    )
  }
}

export default useArticleSettings