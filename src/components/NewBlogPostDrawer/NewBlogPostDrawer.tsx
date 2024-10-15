'use client';;
import { Button, Drawer, Form, message, notification } from "antd";
import NewBlogPostForm from "../NewBlogPostForm/NewBlogPostForm";
import { getUserId } from "@/helpers/user";
import { getUTCHourAndMinute } from "@/helpers/date";
import { format } from "date-fns";
import axios from "axios";
import useProjectId from "@/hooks/useProjectId";
import DrawerTitle from "../DrawerTitle/DrawerTitle";
import { useState } from "react";
import usePricingModal from "@/hooks/usePricingModal";
import useUser from "@/hooks/useUser";

type Props = {
  open: boolean;
  onClose: () => void;
}

const NewBlogPostDrawer = ({ open, onClose }: Props) => {
  const projectId = useProjectId();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pricingModal = usePricingModal();

  const fieldStructuredSchemas = Form.useWatch("structured_schemas", form);
  const fieldWordCount = Form.useWatch("word_count", form);
  const titleMode = Form.useWatch("title_mode", form);
  const extra = ((fieldStructuredSchemas?.length ?? 0) / 4);
  const [estimatedPseoCreditsCount, setEstimatedPseoCreditsCount] = useState(0)
  const creditsCount = titleMode === "programmatic_seo" ? estimatedPseoCreditsCount : 1 + extra;
  const user = useUser();

  const wordCredits = fieldWordCount + (fieldStructuredSchemas?.length ?? 0) * 100;

  const writeBlogPost = async (values: any) => {
    try {
      if (!user.premium.words || user.premium.words < values.word_count + (values.structured_schemas.length * 100)) {
        return pricingModal.open(true)
      }
      setIsSubmitting(true)
      axios.post('/api/write/blog-post/schedule', {
        ...values,
        utc_offset: new Date().getTimezoneOffset()
      })
      message.success('Blog posts will be added in the queue shortly!');
      onClose();
      form.resetFields();
      setIsSubmitting(false)
    } catch (e) {
      if (e?.response?.status === 401) {
        return pricingModal.open(true)
      }
      setIsSubmitting(false)
      console.error(e)
      notification.error({
        message: "We had an issue adding your blog post in the queue please try again",
        placement: "bottomRight",
        role: "alert",
      })
    }
  }

  const writeBlogPostInBulk = async (values: any) => {
    try {
      const costInWords = (values.headlines.length * values.word_count) + (values.headlines.length * (values.structured_schemas.length * 100));
      if (!user.premium.words || user.premium.words < costInWords) {
        return pricingModal.open(true)
      }
      setIsSubmitting(true)
      axios.post('/api/write/blog-post/bulk-schedule', {
        ...values,
        utc_offset: new Date().getTimezoneOffset()
      })
      message.success('Blog posts will be added in the queue shortly!');
      onClose();
      form.resetFields();
      setIsSubmitting(false)
    } catch (e) {
      if (e?.response?.status === 401) {
        return pricingModal.open(true)
      }
      setIsSubmitting(false)
      console.error(e)
      notification.error({
        message: "We had an issue adding your blog posts in the queue please try again",
        placement: "bottomRight",
        role: "alert",
      })
    }
  }

  const onSubmit = async (values: any) => {
    const isProgrammaticSeo = values.title_mode === "programmatic_seo";

    const commonData = {
      ...values,
      content_type: values.content_type.replaceAll("_", " "),
      userId: await getUserId(),
      project_id: projectId
    }

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

      await writeBlogPostInBulk({
        ...commonData,
        headlines,
        ...getUTCHourAndMinute(format(new Date(), "HH:mm")),
      });

      return;
    }

    await writeBlogPost(commonData);
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
        <div className="flex flex-row justify-end items-center gap-4">
          <p>You need at least <b>{wordCredits}</b> words credits</p>
          <Button
            onClick={() => form.submit()}
            type="primary"
            style={{ width: 150 }}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Write
          </Button>
        </div>
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