'use client';
import { useState } from "react";
import { IconCheck, IconX } from '@tabler/icons-react';
import { notifications } from "@mantine/notifications";
import useArticles from "@/hooks/useArticles";
import { useForm } from "@mantine/form";
import useProjectId from "./useProjectId";
import { contentTypes } from "@/components/WriteArticleModal/options";
import NewHeadlinesModal from "@/components/NewHeadlinesModal/NewHeadlinesModal";
import useTopicClusters from "./useTopicClusters";
import useActiveTopicId from "./useActiveTopicId";
import { urlRegex } from "@/constants";
import { isEmpty } from "lodash";

type UseCreateBulkArticles = {
  article?: any;
}

const useCreateBulkArticles = ({ article }: UseCreateBulkArticles = {}) => {
  const articles = useArticles();
  const [show, setShow] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [step, setStep] = useState(0);
  const activeProjectId = useProjectId();
  const activeTopicId = useActiveTopicId();
  const { data: topic } = useTopicClusters().getOne(activeTopicId);

  const form = useForm({
    initialValues: {
      max_keywords: 10,
      project_id: activeProjectId,
      topic_cluster_id: activeTopicId.toString(),
      topic_cluster_name: topic?.name,
      keywords: [],
      write_on_save: false,
      articles: []
    },
    validateInputOnChange: true,
    validateInputOnBlur: true,
    validate: (values) => {
      if (step === 0) {
        return {
          keywords: !values.keywords.length || values.keywords.length > values.max_keywords ? `Select up to ${values.max_keywords} keywords` : null,
        }
      }
      if (step === 1) {
        const articlesValidation = values.articles.map((article) => {
          return {
            content_type: !article?.content_type ? 'Select a content type' : null,
            purpose: !article?.purpose ? 'Select a purpose' : null,
            tones: !article?.tones?.length ? 'Select a tone' : null,
            resource_urls: article?.resource_urls.length && article?.resource_urls.split('\n').some((url: string) => !urlRegex.test(url)) ? 'Please enter valid urls' : null
            // additional_info: article?.additional_info ? 'error' : null
          }
        });

        const allArticlesValid = articlesValidation.map((i) => Object.values(i).every(i => isEmpty(i))).every(i => isEmpty(i))

        if (allArticlesValid) {
          return {}
        }

        return {
          articles: articlesValidation
        }
      }
      return {}
    },
  });

  const onSubmit = () => {
    const values = form.values;
    if (step === 1) {
      console.log('on submit')
      return;
    }
    setError(false)
    setLoading(true)
    try {
      notifications.show({
        id: 'new_article_ideas',
        // title: `Creating headlines for ${selectedTopic?.name}`,
        title: "Creating headlines",
        message: 'Please wait it can take some times.',
        loading: true,
        withCloseButton: false,
        autoClose: false,
      })
      articles.getArticleIdeas.mutateAsync({
        ...values,
        topic_cluster_name: topic?.name,
        content_type: contentTypes.find((i: any) => values.content_type.includes(i.value))?.label,
        purpose: contentTypes.find((i: any) => values.purpose.includes(i.value))?.label,
      })
        .then(({ data }) => {
          notifications.update({
            id: 'new_article_ideas',
            message: 'Headlines created.',
            color: 'green',
            loading: false,
            icon: <IconCheck size="1rem" />,
            autoClose: 3000,
          })
        })
        .catch(() => {
          notifications.update({
            id: 'new_article_ideas',
            message: 'Something went wrong during the creation, please try again.',
            color: 'red',
            loading: false,
            icon: <IconX size="1rem" />,
            autoClose: 3000,
          })
          setLoading(false)
          setError(true)
        })
      onCloseModal()
    } catch {
      setLoading(false)
      setError(true)
      return;
    }
  }

  const onOpenModal = () => {
    setShow(true);
  }

  const onCloseModal = () => {
    setShow(false);
    setError(false);
    form?.reset?.()
    setLoading(false)
  }

  return {
    open: onOpenModal,
    form,
    modal: () => show && (
      <NewHeadlinesModal
        opened={true}
        onClose={onCloseModal}
        isLoading={isLoading}
        onSubmit={onSubmit}
        form={form}
        error={error}
        step={step}
        setStep={setStep}
        keywords={topic?.keywords?.result || []}
      />
    )
  }
}

export default useCreateBulkArticles