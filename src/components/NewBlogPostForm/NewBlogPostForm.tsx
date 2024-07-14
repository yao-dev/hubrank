'use client';;
import useProjectId from "@/hooks/useProjectId";
import useProjects from "@/hooks/useProjects";
import {
  Alert,
  AutoComplete,
  Flex,
  Form,
  FormInstance,
  Input,
  Segmented,
  Select,
  Switch,
  message,
} from "antd";
import { useEffect, useState } from "react";
import useDrawers from "@/hooks/useDrawers";
import useWritingStyles from "@/hooks/useWritingStyles";
import useLanguages from "@/hooks/useLanguages";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { isEmpty } from "lodash";
import supabase from "@/helpers/supabase";
import { useRouter } from "next/navigation";
import MultiSelectTagList from "../MultiSelectTagList/MultiSelectTagList";
import Label from "../Label/Label";
import { contentTypes, structuredSchemas } from "@/options";
import LanguageSelect from "../LanguageSelect/LanguageSelect";
import WritingStyleSelect from "../WritingStyleSelect/WritingStyleSelect";

type Props = {
  onSubmit: (values: any) => void;
  form: FormInstance<any>
}

const NewBlogPostForm = ({ form, onSubmit }: Props) => {
  const projectId = useProjectId();
  const { data: project, isPending } = useProjects().getOne(projectId)
  const { data: writingStyles } = useWritingStyles().getAll();
  const { data: languages } = useLanguages().getAll();
  const [, contextHolder] = message.useMessage();
  const router = useRouter();
  const fieldTitleStructure = Form.useWatch("title_structure", form) ?? "";
  const fieldStructuredSchemas = Form.useWatch("structured_schemas", form);
  const dynamic = Form.useWatch("external_source", form);
  const [variableSet, setVariableSet] = useState({});
  const drawers = useDrawers();


  useEffect(() => {
    if (project && drawers.blogPost.isOpen) {
      form.setFieldValue("seed_keyword", drawers.blogPost.seedKeyword);
      form.setFieldValue("language_id", drawers.blogPost.languageId || project.language_id)
      form.setFieldValue("sitemap", project.sitemap || "");
    }
  }, [project, drawers.blogPost.isOpen]);

  const { data: savedKeywordsOptions = [] } = useQuery({
    queryKey: ["saved_keywords", { projectId }],
    placeholderData: keepPreviousData,
    queryFn: () => {
      return supabase.from("saved_keywords").select("*, languages!language_id(*)").eq("project_id", projectId).limit(1000).order("id", { ascending: false })
    },
    select: ({ data }: any) => {
      return (data || []).map((i: any) => {
        return {
          label: i.keyword,
          value: i.keyword,
        }
      });
    }
  });

  if (isPending) return null;

  const onAddTag = (list: string[], tag: string, checked: boolean, field: string) => {
    const nextSelectedTags = checked
      ? [...list, tag]
      : list.filter((t) => t !== tag);
    form.setFieldValue(field, nextSelectedTags);
  }

  const getVariables = () => {
    const variables = new Set([]);

    if (fieldTitleStructure) {
      const acceptedChars = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "_"]
      let isVarOpen;
      let variable = "";

      fieldTitleStructure.split("").forEach((char) => {
        if (char === "{") {
          isVarOpen = true;
          return;
        };
        if (char === "}") {
          isVarOpen = false;

          if (variables.size < 3 && variable.length > 0) {
            variables.add(variable)
          }

          variable = ""
          return;
        }
        if (!acceptedChars.includes(char)) {
          isVarOpen = false;
          variable = ""
          return;
        }
        variable += char
      });
    }

    return [...variables]
  }

  const estimatedPSeoArticlesCount = isEmpty(variableSet) ? 0 : Object.values(variableSet).map((i) => i.split('\n').length).reduce((a, b) => a * b)

  return (
    <Flex vertical gap="large" style={{ height: "100%" }}>
      {contextHolder}
      <Form
        form={form}
        initialValues={{
          seed_keyword: drawers.blogPost.seedKeyword,
          title_mode: "ai",
          custom_title: "",
          inspo_title: "",
          article_count: 0,
          title_structure: "",
          variables: [],
          content_type: "",
          // purpose: "", // TODO: remove it in favor of purposes
          writing_mode: "custom",
          writing_style_id: !!writingStyles?.data ? writingStyles.data.find((i) => !!i.default)?.id : null,
          tones: [],
          purposes: [], // TODO: add in DB, use it in BE write endpoint
          emotions: [], // TODO: add in DB, use it in BE write endpoint
          vocabularies: [], // TODO: add in DB, use it in BE write endpoint
          sentence_structures: [], // TODO: add in DB, use it in BE write endpoint
          perspectives: [], // TODO: add in DB, use it in BE write endpoint
          writing_structures: [], // TODO: add in DB, use it in BE write endpoint
          instructional_elements: [], // TODO: add in DB, use it in BE write endpoint
          clickbait: false,
          // perspective: "first_person_singular", // TODO: remove it in favor of perspectives
          word_count: 500,
          additional_information: "",
          sitemap: "",
          external_sources: [],
          with_featured_image: false,
          with_table_of_content: false,
          with_introduction: false,
          with_conclusion: false,
          with_key_takeways: false,
          with_faq: false,
          with_sections_image: false,
          with_sections_image_mode: 'Auto',
          image_source: 'Unsplash',
          with_seo: true,
          language_id: null,
          with_hook: false,
          structured_schemas: [],
          youtube_url: ""
        }}
        autoComplete="off"
        layout="vertical"
        // onFinish={onFinish}
        onFinish={onSubmit}
      >
        <Form.Item
          name="language_id"
          label={<Label name="Language" />}
          rules={[{
            required: true,
            type: "number",
            message: "Select a language"
          }]}
          hasFeedback
        >
          <LanguageSelect languages={languages} />
        </Form.Item>

        <Form.Item name="seed_keyword" label={<Label name="Main keyword" />} rules={[{ required: true, type: "string", max: 75, message: "Add a main keyword" }]} hasFeedback>
          <AutoComplete options={savedKeywordsOptions}>
            <Input placeholder="Main keyword" count={{ show: true, max: 75 }} />
          </AutoComplete>
        </Form.Item>

        <Form.Item
          name="title_mode"
          label={<Label name="Mode" />}
          rules={[{ required: true }]}
        >
          <Segmented
            options={[
              { label: "AI", value: "ai" },
              { label: "Inspo", value: "inspo" },
              { label: "Custom title", value: "custom" },
              { label: "Programmatic SEO", value: "programmatic_seo" },
              { label: "Youtube to blog", value: "youtube_to_blog" },
            ]}
            style={{ width: "fit-content" }}
          />
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.title_mode !== currentValues.title_mode}
        >
          {({ getFieldValue }) => {
            if (getFieldValue('title_mode') === "custom") {
              return (
                <Form.Item name="custom_title" label="Custom title" rules={[{ required: true, type: "string", max: 75 }]} hasFeedback>
                  <Input placeholder="Custom title" count={{ show: true, max: 75 }} />
                </Form.Item>
              )
            }

            if (getFieldValue('title_mode') === "inspo") {
              return (
                <>
                  <Form.Item name="inspo_title" label={<Label name="Inspo title" />} help="" rules={[{ required: true, type: "string", max: 75 }]} hasFeedback>
                    <Input placeholder="Inspo title" count={{ show: true, max: 75 }} />
                  </Form.Item>
                  <Flex gap="small" align="center" style={{ marginBottom: 24 }}>
                    <Form.Item name="clickbait" rules={[]} style={{ margin: 0 }}>
                      <Switch size="small" />
                    </Form.Item>
                    <span>Clickbait title</span>
                  </Flex>
                </>
              )
            }

            if (getFieldValue('title_mode') === "ai") {
              return (
                <Flex gap="small" align="center" style={{ marginBottom: 24 }}>
                  <Form.Item name="clickbait" rules={[]} style={{ margin: 0 }}>
                    <Switch size="small" />
                  </Form.Item>
                  <span>Clickbait title</span>
                </Flex>
              )
            }

            if (getFieldValue('title_mode') === "programmatic_seo") {
              const variables = getVariables()
              return (
                <Flex vertical gap="middle" style={{ marginTop: 20, marginBottom: 20 }}>
                  {/* <Form.Item
                    name="article_count"
                    label={<Label name="How many articles?" />}
                    rules={[{ required: true, type: "integer", min: 1, max: 500 }]}
                  >
                    <InputNumber />
                  </Form.Item> */}
                  <Form.Item
                    name="title_structure"
                    label={<Label name="Title structure" />}
                    rules={[{ required: true, type: "string", max: 150 }]}
                    hasFeedback
                    help="ex: How to {action} in {city} will generate => How to Hike in Zurich"
                  >
                    <Input
                      placeholder="ex: How to {variable_1} in {variable_2}"
                      count={{ show: true, max: 150 }}
                      onChange={() => {
                        setVariableSet((prev) => {
                          Object.keys(prev).forEach((i) => {
                            if (!variables.includes(i)) {
                              delete prev[i]
                            }
                          })
                          return prev;
                        })
                      }}
                    />
                  </Form.Item>

                  <Form.Item noStyle>
                    <Alert message={`${estimatedPSeoArticlesCount} articles will be written`} type="info" />
                  </Form.Item>

                  {[...variables].map((variable, index) => {
                    return (
                      <Form.Item
                        key={variable}
                        // name={`variables-${variable}`}
                        label={<Label name={`Variable ${index + 1}: ${variable}`} />}
                        // help={`Describe in few words what ${variable} represents`}
                        help="One value per line"
                        rules={[{ required: true, type: "string" }]}
                      >
                        <Input.TextArea
                          placeholder={["value 1", "value 2", "value 3"].join('\n')}
                          autoSize={{ minRows: 2, maxRows: 6 }}
                          onChange={e => {
                            setVariableSet((prev) => {
                              return {
                                ...prev,
                                [variable]: e.target.value
                              }
                            })
                          }}
                        />
                      </Form.Item>
                    )
                  })}
                </Flex>
              )
            }

            if (getFieldValue('title_mode') === "youtube_to_blog") {
              return (
                <Form.Item
                  label={<Label name="Youtube url" />}
                  name="youtube_url"
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[{ required: true, message: 'Please enter a valid url', type: "url" }]}
                  hasFeedback
                  style={{ marginBottom: 24 }}
                >
                  <Input placeholder="Youtube URL" />
                </Form.Item>
              )
            }
          }}
        </Form.Item>

        <Form.Item name="content_type" label={<Label name="Content type" />} rules={[{ required: true, type: "string", message: "Select a content type" }]} hasFeedback>
          <Select
            showSearch
            placeholder="Select a content type"
            options={contentTypes}
          />
        </Form.Item>

        {/* <Form.Item name="purpose" label="Purpose" rules={[{ required: true, type: "string", message: "Select a purpose" }]} hasFeedback>
          <Select
            showSearch
            placeholder="Select a purpose"
            options={purposes}
          />
        </Form.Item> */}

        <WritingStyleSelect form={form} />

        {/* <Form.Item>
          {tones.map((tone) => {
            const isChecked = fieldTones?.includes(tone.label)
            return (
              <Tag.CheckableTag
                key={tone.value}
                // checked={getIsToneSelected(tone.label)}
                // checked={form.getFieldValue("tones")?.includes(tone.value)}
                checked={isChecked}
                // onClick={() => onAddTone(tone.label)}
                onChange={(checked) => onAddTone(tone.label, checked)}
                style={{ marginBottom: 3, cursor: "pointer", background: !isChecked ? "#fafafa" : undefined }}
              >
                {tone.label}
              </Tag.CheckableTag>
            )
          })}
        </Form.Item> */}

        {/* <Form.Item
          name="perspective"
          label="Perspective"
          rules={[{ required: true, message: "Select a perspective" }]}
          hasFeedback
        >
          <Segmented

            options={[
              {
                label: "I, me, my",
                value: "first_person_singular"
              },
              {
                label: "we, us, our",
                value: "first_person_plural"
              },
              {
                label: "You, your",
                value: "second_person"
              },
              // {
              //   label: "3rd person",
              //   value: "third_person"
              // },
            ]}
            style={{ width: "fit-content" }}
          />
        </Form.Item> */}

        <Flex vertical gap="small">
          <Form.Item
            name="word_count"
            label={<Label name="Words count" />}
            rules={[]}
            hasFeedback
            help="More or less the amount of words the article will contains"
          >
            <Segmented options={[500, 750, 1000, 1500, 2000]} style={{ width: "fit-content" }} />
          </Form.Item>

          <Form.Item
            name="additional_information"
            label={<Label name="Additional information" />}
            rules={[{ type: "string", max: 150 }]}
            hasFeedback
          >
            <Input.TextArea
              placeholder="Provide any context or information we should consider while writing your article"
              autoSize={{ minRows: 3, maxRows: 5 }}
              count={{
                show: true,
                max: 150,
              }}
            />
          </Form.Item>

          <Form.Item
            // hidden
            name="sitemap"
            label={<Label name="Sitemap" />}
            rules={[{
              required: false,
              type: "url",
              message: "Enter a valid url",
              transform: (url: any) => {
                if (!url?.startsWith('https://')) {
                  url = `https://${url}`
                }
                return new URL(url).origin
              }
            }]}
            help="We'll use this sitemap to include internal links in the article"
            hasFeedback
            style={{ marginBottom: 42 }}
          >
            <Input placeholder="Sitemap url" />
          </Form.Item>

          {/* <ExternalSourcesField name="external_sources" /> */}

          <Form.Item name="structured_schemas" label={<Label name="Schema markup (ld+json)" />}>
            <MultiSelectTagList
              field="structured_schemas"
              options={structuredSchemas}
              selectedOptions={fieldStructuredSchemas}
              onAddTag={onAddTag}
            />
          </Form.Item>

          <Form.Item
            hidden
            name="external_sources"
            label={<Label name="External source" />}
            rules={[{ type: "string" }]}
            help="Add a source to help the AI write content with real time data that it might not have knowledge of (invalid links will be ignored)"
          >
            <Input.TextArea
              placeholder={`reddit.com\nquora.com`}
              autoSize={{ minRows: 3, maxRows: 5 }}
            // count={{
            //   show: true,
            //   max: 150,
            // }}
            />
          </Form.Item>

          <Form.Item
            hidden
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.external_sources !== currentValues.external_sources}
          >
            {({ getFieldValue }) => {
              return getFieldValue('external_sources')?.length > 3 ? (
                <Form.Item
                  name="external_sources_objective"
                  label={<Label name="External sources objective" />}
                  rules={[{ required: true, type: "string", max: 500 }]}
                  help="Simply describe what you want to do with the content we scrape"
                  hasFeedback
                >
                  <Input.TextArea
                    placeholder="Type here"
                    autoSize={{ minRows: 3, maxRows: 5 }}
                    count={{
                      show: true,
                      max: 150,
                    }}
                  />
                </Form.Item>
              ) : null

            }}
          </Form.Item>
        </Flex>

        <Flex gap="small" align="center">
          <Form.Item name="with_hook" tooltip="Short sentence that comes before the introduction, its goal is to capture the reader's attention and encourage them to continue reading." rules={[]} style={{ margin: 0 }}>
            <Switch size="small" />
          </Form.Item>
          <span>Include hook</span>
        </Flex>

        <Flex gap="small" align="center">
          <Form.Item name="with_introduction" rules={[]} style={{ margin: 0 }}>
            <Switch size="small" />
          </Form.Item>
          <span>Introduction</span>
        </Flex>

        <Flex gap="small" align="center">
          <Form.Item name="with_conclusion" rules={[]} style={{ margin: 0 }}>
            <Switch size="small" />
          </Form.Item>
          <span>Conclusion</span>
        </Flex>

        <Flex gap="small" align="center">
          <Form.Item name="with_key_takeways" rules={[]} style={{ margin: 0 }}>
            <Switch size="small" />
          </Form.Item>
          <span>Key takeways</span>
        </Flex>

        <Flex gap="small" align="center">
          <Form.Item name="with_faq" rules={[]} style={{ margin: 0 }}>
            <Switch size="small" />
          </Form.Item>
          <span>FAQ</span>
        </Flex>

        <Flex vertical>
          <Flex gap="small" align="center">
            <Form.Item name="with_featured_image" rules={[]} style={{ margin: 0 }}>
              <Switch size="small" />
            </Form.Item>
            <span>Include featured image</span>
          </Flex>

          {/* <Flex gap="small" align="center">
          <Form.Item name="with_table_of_content" rules={[]} style={{ margin: 0 }}>
            <Switch size="small" />
          </Form.Item>
          <span>Table of content</span>
        </Flex> */}

          <Flex gap="small" align="center" style={{ marginBottom: 18 }}>
            <Form.Item name="with_sections_image" style={{ margin: 0 }}>
              <Switch size="small" />
            </Form.Item>
            <span>Include sections image</span>
          </Flex>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.with_sections_image !== currentValues.with_sections_image}
          >
            {({ getFieldValue }) => {
              return !!getFieldValue('with_sections_image') ? (
                <>
                  {/* <Form.Item
                  name="with_sections_image_mode"
                  label="Sections with image" rules={[]}
                  tooltip='Select "Auto" to let the AI decide where it makes sense to include images in the content'
                >
                  <Segmented defaultValue="Auto" options={['Auto', 'All sections (h2)']} style={{ width: "fit-content" }} />
                </Form.Item> */}

                  <Form.Item name="image_source" rules={[]}>
                    <Segmented options={['Unsplash', 'Pexels']} style={{ width: "fit-content" }} />
                  </Form.Item>
                </>
              ) : null

            }}
          </Form.Item>

          {/* <Flex gap="small" align="center">
          <Form.Item name="with_seo" rules={[]} style={{ margin: 0 }}>
            <Switch size="small" />
          </Form.Item>
          <span>SEO tags & Schema markups</span>
        </Flex> */}
        </Flex>
      </Form>
    </Flex>
  )
}

export default NewBlogPostForm