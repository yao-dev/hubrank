'use client';;
import { Button, Drawer, Flex, Form, message, notification } from "antd";
import NewBlogPostForm from "../NewBlogPostForm/NewBlogPostForm";
import { getUserId } from "@/helpers/user";
import { getUTCHourAndMinute } from "@/helpers/date";
import { format } from "date-fns";
import axios from "axios";
import useProjectId from "@/hooks/useProjectId";
import DrawerTitle from "../DrawerTitle/DrawerTitle";
import { useState } from "react";
import usePricingModal from "@/hooks/usePricingModal";

type Props = {
  open: boolean;
  onClose: () => void;
}

const NewBlogPostDrawer = ({ open, onClose }: Props) => {
  const projectId = useProjectId();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [variableSet, setVariableSet] = useState({});
  const pricingModal = usePricingModal();
  const fieldStructuredSchemas = Form.useWatch("structured_schemas", form);
  const titleMode = Form.useWatch("title_mode", form);
  const estimatedPSeoArticlesCount = Form.useWatch("estimated_pseo_articles_count", form);
  const extra = ((fieldStructuredSchemas?.length ?? 0) / 4);
  const [estimatedPseoCreditsCount, setEstimatedPseoCreditsCount] = useState(0)
  const creditsCount = titleMode === "programmatic_seo" ? estimatedPseoCreditsCount : 1 + extra

  const writeArticle = async (values: any) => {
    console.log("writeArticle", values)
    try {
      setIsSubmitting(true)
      const { data } = await axios.post('/api/credits-check', {
        user_id: await getUserId(),
        action: 'write-blog-post',
        extra
      });
      if (!data.authorized) {
        setIsSubmitting(false)
        return pricingModal.open(true)
      }
      axios.post('/api/write/blog-post/schedule', values)
      message.success('Article added in the queue!');
      onClose();
      form.resetFields();
      setIsSubmitting(false)
    } catch (e) {
      setIsSubmitting(false)
      console.error(e)
      notification.error({
        message: "We had an issue adding your article in the queue please try again",
        placement: "bottomRight",
        role: "alert",
      })
    }
  }

  const schedulePSeoArticles = async (values: any) => {
    console.log("schedulePSeoArticles", values)
    try {
      setIsSubmitting(true)
      const { data } = await axios.post('/api/credits-check', {
        user_id: await getUserId(),
        action: 'write-pseo',
        extra: estimatedPseoCreditsCount
      });
      if (!data.authorized) {
        setIsSubmitting(false);
        return pricingModal.open(true)
      }
      axios.post('/api/write/pseo/schedule', values);
      message.success('Articles will be added in the queue shortly!');
      onClose();
      form.resetFields();
      setIsSubmitting(false)
    } catch (e) {
      setIsSubmitting(false)
      console.error(e)
      notification.error({
        message: "We had an issue adding your articles in the queue please try again",
        placement: "bottomRight",
        role: "alert",
      })
    }
  }

  const onSubmit = async (values: any) => {
    console.log("NewBlogPostDrawer - onSubmit", values);

    const isProgrammaticSeo = values.title_mode === "programmatic_seo";

    if (isProgrammaticSeo) {
      const generateCombinations = () => {
        const keys = Object.keys(values.variableSet);
        const vSet = keys.map(key => values.variableSet[key].split('\n'));
        const results = [];

        function combine(prefix, index) {
          if (index === keys.length) {
            let title = values.title_structure;
            for (let i = 0; i < keys.length; i++) {
              title = title.replace(`{${keys[i]}}`, prefix[i]);
            }
            results.push(title);
            return;
          }

          vSet[index].forEach(value => {
            combine([...prefix, value], index + 1);
          });
        }

        combine([], 0);
        return results
      }

      const headlines = generateCombinations();

      return schedulePSeoArticles({
        ...values,
        content_type: values.content_type.replaceAll("_", " "),
        clickbait: !!values.clickbait,
        userId: await getUserId(),
        project_id: projectId,
        headlines,
        ...getUTCHourAndMinute(format(new Date(), "HH:mm")),
      });
    }

    await writeArticle({
      ...values,
      content_type: values.content_type.replaceAll("_", " "),
      clickbait: !!values.clickbait,
      userId: await getUserId(),
      project_id: projectId
    });
    return;
  };

  return (
    <Drawer
      title={<DrawerTitle title="New blog post" />}
      width={600}
      onClose={() => {
        onClose();
      }}
      open={open}
      destroyOnClose
      closable={!isSubmitting}
      styles={{
        body: {
          paddingBottom: 80,
        },
      }}
      footer={
        <Flex justify="end">
          <Button
            onClick={() => form.submit()}
            type="primary"
            style={{ width: 150 }}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Write ({creditsCount} {creditsCount > 1 ? "credits" : "credit"})
          </Button>
        </Flex>
      }
    >
      <NewBlogPostForm
        form={form}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        setEstimatedPseoCreditsCount={setEstimatedPseoCreditsCount}
      />
    </Drawer>
  )
}

export default NewBlogPostDrawer