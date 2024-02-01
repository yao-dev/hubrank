'use client';;
import { getUserId } from "@/helpers/user";
import useProjectId from "@/hooks/useProjectId";
import useProjects from "@/hooks/useProjects";
import useWritingStyles from "@/hooks/useWritingStyles";
import { App, Button, Drawer, Flex, Form, Steps } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import SettingsForm from "./SettingsForm";
import HeadlineForm from "./HeadlineForm";
import OutlineForm from "./OutlineForm";

const steps = [
  {
    title: 'Article settings',
  },
  {
    title: 'Select headline',
  },
  {
    title: 'Select outline',
  },
]

type Props = {
  open: boolean;
  onClose: () => void;
  selectedKeyword?: any;
}

const NewArticleDrawer = ({ open, onClose, selectedKeyword }: Props) => {
  const { message, notification } = App.useApp();
  const projectId = useProjectId();
  const { data: project, isLoading } = useProjects().getOne(projectId)
  const [submitLoading, setSubmitLoading] = useState(false);
  const { data: writingStyles } = useWritingStyles().getAll();
  const [headlines, setHeadlines] = useState([]);

  const [currentStep, setCurrentStep] = useState(0);
  const [lockedStep, setLockedStep] = useState<number | void>();
  const [submittingStep, setSubmittingStep] = useState<number | void>();
  const [settingsForm] = Form.useForm();
  const [headlineForm] = Form.useForm();
  const [outlineForm] = Form.useForm();

  const prev = () => {
    if (settingsForm.getFieldValue("title_mode") === "custom") {
      setCurrentStep(0);
      return;
    }
    setCurrentStep(currentStep - 1);
  };

  // const keywords = useMemo(() => {
  //   if (!project || !project?.keywords?.length) return [];

  //   return project.keywords.map((item: any) => {
  //     return {
  //       cpc: item?.keyword_data?.keyword_info.cpc || "N/A",
  //       keyword: item?.keyword_data?.keyword || "N/A",
  //       value: item?.keyword_data?.keyword || "N/A",
  //       competition: item?.keyword_data?.keyword_info.competition || "N/A",
  //       search_volume: item?.keyword_data?.keyword_info.search_volume || "N/A",
  //     }
  //   })
  // }, [project]);

  useEffect(() => {
    if (project && open) {
      settingsForm.setFieldValue("language_id", selectedKeyword ? +selectedKeyword.language_id : +project.language_id)
      settingsForm.setFieldValue("seed_keyword", selectedKeyword?.keyword || "")
    }
  }, [project, open, selectedKeyword])

  useEffect(() => {
    if (!!writingStyles?.data && writingStyles.data.length > 0) {
      settingsForm.setFieldValue("writing_style_id", writingStyles.data.find((i) => !!i.default).id)
    }
  }, [writingStyles]);

  const onFinish = async (values: any) => {
    try {
      setSubmitLoading(true);
      let title = "";

      if (values.title_mode === "Custom") {
        title = values.custom_title;
      }
      if (values.title_mode === "Inspo") {
        title = values.inspo_title;
      }

      const { data } = await axios.post("/api/queue", {
        ...values,
        title,
        writing_style_id: values.writing_style_id ? +values.writing_style_id : null,
        user_id: await getUserId(),
        project_id: projectId,
        language_id: +values.language_id
      });

      if (data?.error) {
        throw new Error("");
      }

      onClose()
      message.success('Article added in the queue!');
    } catch (e) {
      notification.error({
        message: "We had an issue adding your article in the queue please try again",
        placement: "bottomRight",
        role: "alert",
        duration: 5,
      })
    } finally {
      setSubmitLoading(false)
    }

  };

  if (isLoading) return null;

  return (
    <Drawer
      title="New article"
      width={600}
      onClose={() => {
        onClose();
        settingsForm.resetFields()
        headlineForm.resetFields()
        outlineForm.resetFields()
      }}
      open={open}
      destroyOnClose
      closable={submittingStep === undefined}
      styles={{
        body: {
          paddingBottom: 80,
        },
      }}
      footer={
        <Flex justify="space-between">
          <Button disabled={submittingStep !== undefined} onClick={onClose}>Cancel</Button>
          <Flex justify="end" align="center" gap="middle">
            {currentStep > 0 && (
              <Button disabled={submittingStep !== undefined} onClick={() => prev()}>
                Previous
              </Button>
            )}

            {currentStep === 0 && (
              <Button onClick={() => settingsForm.submit()} type="primary" loading={submittingStep === 0}>
                Next
              </Button>
            )}
            {currentStep === 1 && (
              <Button onClick={() => headlineForm.submit()} type="primary" loading={submittingStep === 1}>
                Next
              </Button>
            )}
            {currentStep === 2 && (
              <Button onClick={() => outlineForm.submit()} type="primary" loading={submittingStep === 2}>
                Write article
              </Button>
            )}
          </Flex>
        </Flex>
      }
    >
      <Flex vertical gap="large">
        <Steps
          size="small"
          current={currentStep}
          items={steps}
        />

        {currentStep === 0 && (
          <SettingsForm
            form={settingsForm}
            isLocked={lockedStep !== undefined && lockedStep >= 0}
            setLockedStep={setLockedStep}
            submittingStep={submittingStep}
            setCurrentStep={setCurrentStep}
            setHeadlines={setHeadlines}
            setSubmittingStep={setSubmittingStep}
          />
        )}

        {currentStep === 1 && (
          <HeadlineForm
            form={headlineForm}
            isLocked={lockedStep !== undefined && lockedStep >= 1}
            setLockedStep={setLockedStep}
            submittingStep={submittingStep}
            setCurrentStep={setCurrentStep}
            headlines={headlines}
          />
        )}

        {currentStep === 2 && (
          <OutlineForm
            form={outlineForm}
            values={{
              // ...settingsForm.getFieldsValue(),
              title: settingsForm.getFieldValue("title_mode") === "custom" ? settingsForm.getFieldValue("custom_title") : headlineForm.getFieldValue("title"),
              project_id: projectId,
              title_mode: settingsForm.getFieldValue("title_mode"),
              seed_keyword: settingsForm.getFieldValue("seed_keyword"),
              language_id: settingsForm.getFieldValue("language_id"),
              content_type: settingsForm.getFieldValue("content_type"),
              purpose: settingsForm.getFieldValue("purpose"),
              tones: settingsForm.getFieldValue("tones"),
              perspective: settingsForm.getFieldValue("perspective"),
              clickbait: settingsForm.getFieldValue("clickbait"),
              sitemap: settingsForm.getFieldValue("sitemap"),
              external_sources: settingsForm.getFieldValue("external_sources"),
              external_sources_objective: settingsForm.getFieldValue("external_sources_objective"),
              with_featured_image: settingsForm.getFieldValue("with_featured_image"),
              with_table_of_content: settingsForm.getFieldValue("with_table_of_content"),
              with_sections_image: settingsForm.getFieldValue("with_sections_image"),
              with_sections_image_mode: settingsForm.getFieldValue("with_sections_image_mode"),
              image_source: settingsForm.getFieldValue("image_source"),
              with_seo: settingsForm.getFieldValue("with_seo"),
              writing_mode: settingsForm.getFieldValue("writing_mode"),
              writing_style_id: settingsForm.getFieldValue("writing_style_id"),
              additional_information: settingsForm.getFieldValue("additional_information"),
              word_count: settingsForm.getFieldValue("word_count"),
            }}
            isLocked={lockedStep !== undefined && lockedStep >= 2}
            setLockedStep={setLockedStep}
            submittingStep={submittingStep}
            setSubmittingStep={setSubmittingStep}
            setCurrentStep={setCurrentStep}
          />
        )}
      </Flex>
    </Drawer>
  )
}

export default NewArticleDrawer