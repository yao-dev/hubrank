'use client';;
import { getRelatedKeywords } from "@/helpers/seo";
import supabase from "@/helpers/supabase";
import { getUserId } from "@/helpers/user";
import useLanguages from "@/hooks/useLanguages";
import useProjectId from "@/hooks/useProjectId";
import useWritingStyles from "@/hooks/useWritingStyles";
import {
  contentTypes,
  emotions,
  instructionalElements,
  perspectives,
  purposes,
  sentenceStructures,
  tones,
  vocabularies,
  writingStructures,
  structuredSchemas
} from "@/options";
import {
  StarOutlined
} from '@ant-design/icons';
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import {
  Alert,
  AutoComplete,
  Button,
  Flex,
  Form,
  Image,
  Input,
  Segmented,
  Select,
  Space,
  Switch,
  Tag,
  message,
  notification,
} from "antd";
import axios from "axios";
import { compact, isEmpty, uniqueId } from "lodash";
import { useRouter } from "next/navigation";
import { useState } from "react";
import WritingStyleForm from "../WritingStyleForm/WritingStyleForm";
import MultiSelectTagList from "../MultiSelectTagList/MultiSelectTagList";
import Label from "../Label/Label";
import { getUTCHourAndMinute } from "@/helpers/date";
import { format } from "date-fns";

const SettingsForm = ({
  form,
  setLockedStep,
  submittingStep,
  setCurrentStep,
  isLocked,
  setHeadlines,
  setSubmittingStep,
  lockedStep,
  setRelatedKeywords,
}: any) => {
  const { data: writingStyles } = useWritingStyles().getAll();
  const { data: languages } = useLanguages().getAll();
  const projectId = useProjectId();
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();
  const fieldCustomWritingId = Form.useWatch("writing_style_id", form);
  const fieldTones = Form.useWatch("tones", form);
  const fieldPurposes = Form.useWatch("purposes", form);
  const fieldEmotions = Form.useWatch("emotions", form);
  const fieldVocabularies = Form.useWatch("vocabularies", form);
  const fieldSentenceStructures = Form.useWatch("sentence_structures", form);
  const fieldPerspectives = Form.useWatch("perspectives", form);
  const fieldWritingStructures = Form.useWatch("writing_structures", form);
  const fieldInstructionalElements = Form.useWatch("instructional_elements", form);
  const fieldTitleStructure = Form.useWatch("title_structure", form) ?? "";
  const fieldStructuredSchemas = Form.useWatch("structured_schemas", form);
  const [isWritingStyleModalOpened, setIsWritingStyleModalOpened] = useState(false);
  const [variableSet, setVariableSet] = useState({});

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

  const getHeadlines = useMutation({
    mutationFn: async (data: any) => {
      return axios.post("/api/headline-ideas", data)
    },
  });

  const writeArticle = async (values: any) => {
    try {
      axios.post('/api/write', values)
      message.success('Article added in the queue!');
      router.replace(`/projects/${projectId}/articles`)
    } catch {
      notification.error({
        message: "We had an issue adding your article in the queue please try again",
        placement: "bottomRight",
        role: "alert",
      })
    }
  }

  const schedulePSeoArticles = (values: any) => {
    try {
      axios.post('/api/pseo/schedule', values)
      message.success('Articles added in the queue!');
      router.replace(`/projects/${projectId}/articles`)
    } catch (e) {
      console.error(e)
      notification.error({
        message: "We had an issue adding your articles in the queue please try again",
        placement: "bottomRight",
        role: "alert",
      })
    }
  }

  const onFinish = async (values: any) => {
    const isCustomTitle = values.title_mode === "custom";
    const isProgrammaticSeo = values.title_mode === "programmatic_seo";

    if (isLocked) {
      return setCurrentStep(isCustomTitle || isProgrammaticSeo ? 2 : 1)
    }

    if (isProgrammaticSeo) {
      const generateCombinations = () => {
        const keys = Object.keys(variableSet);
        const vSet = keys.map(key => variableSet[key].split('\n'));
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
        // purpose: values.purpose.replaceAll("_", " "),
        // tone: values.tones?.join?.(","),
        content_type: values.content_type.replaceAll("_", " "),
        clickbait: !!values.clickbait,
        userId: await getUserId(),
        // keywords: relatedKeywords,
        project_id: projectId,
        // featuredImage,
        // sectionImages
        headlines,
        variableSet,
        ...getUTCHourAndMinute(format(new Date(), "HH:mm")),
      });
    }

    await writeArticle({
      ...values,
      // purpose: values.purpose.replaceAll("_", " "),
      // tone: values.tones?.join?.(","),
      content_type: values.content_type.replaceAll("_", " "),
      clickbait: !!values.clickbait,
      userId: await getUserId(),
      // keywords: relatedKeywords,
      project_id: projectId
      // featuredImage,
      // sectionImages
    });
    return;

    // try {
    //   messageApi.open({
    //     type: 'loading',
    //     content: 'Getting headline ideas...',
    //     duration: 0,
    //   });

    //   setSubmittingStep(0);
    //   const { data } = await getHeadlines.mutateAsync({
    //     ...values,
    //     project_id: projectId,
    //     // purpose: values.purpose.replaceAll("_", " "),
    //     // tone: values.tones?.join?.(","),
    //     contentType: values.content_type.replaceAll("_", " "),
    //     clickbait: !!values.clickbait
    //   });

    //   setRelatedKeywords(data.keywords);

    //   setSubmittingStep(undefined);
    //   setCurrentStep(1)
    //   setLockedStep(0);

    //   setHeadlines(data.headlines.map((h) => ({
    //     id: uniqueId(h),
    //     headline: h[0] === "-" ? h.slice(1).trim() : h.trim()
    //   })));
    // } catch (e) {
    //   console.error(e)
    //   setSubmittingStep(undefined);
    // } finally {
    //   messageApi.destroy();
    // }
  };

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

  // Object.entries(variableSet).map(([name, value]) => {
  //   const values = value.split("\n").filter((i) => !!i.length)
  // })

  return (
    <>
      {contextHolder}
      <WritingStyleForm
        opened={isWritingStyleModalOpened}
        setModalOpen={setIsWritingStyleModalOpened}
        initialValues={{
          tones: fieldTones,
          purposes: fieldPurposes,
          emotions: fieldEmotions,
          vocabularies: fieldVocabularies,
          sentence_structures: fieldSentenceStructures,
          perspectives: fieldPerspectives,
          writing_structures: fieldWritingStructures,
          instructional_elements: fieldInstructionalElements,
        }}
      />
      <Form
        form={form}
        name="settings-form"
        disabled={submittingStep !== undefined || isLocked}
        initialValues={{
          seed_keyword: "",
          title_mode: "ai",
          custom_title: "",
          inspo_title: "",
          article_count: 0,
          title_structure: "",
          variables: [],
          content_type: "",
          // purpose: "", // TODO: remove it in favor of purposes
          writing_mode: "manual",
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
          external_sources: "",
          external_sources_objective: "",
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
        }}
        autoComplete="off"
        layout="vertical"
        onFinish={onFinish}
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
          <Select
            placeholder="Language"
            optionLabelProp="label"
            options={languages?.map((p) => {
              return {
                ...p,
                label: p.label,
                value: p.id
              }
            })}
            optionRender={(option: any) => {
              return (
                <Space>
                  <Image
                    src={option.data.image}
                    width={25}
                    height={25}
                    preview={false}
                  />
                  {option.label}
                </Space>
              )
            }}
          />
        </Form.Item>

        <Form.Item name="seed_keyword" label={<Label name="Main keyword" />} rules={[{ required: true, type: "string", max: 75, message: "Add a main keyword" }]} hasFeedback>
          <AutoComplete options={savedKeywordsOptions}>
            <Input placeholder="Main keyword" count={{ show: true, max: 75 }} />
          </AutoComplete>
        </Form.Item>

        <Form.Item
          name="title_mode"
          label={<Label name="Title mode" />}
          rules={[{ required: true }]}
        >
          <Segmented
            options={[{ label: "AI", value: "ai" }, { label: "Inspo", value: "inspo" }, { label: "Custom title", value: "custom" }, { label: "Programmatic SEO", value: "programmatic_seo" }]} style={{ width: "fit-content" }} />
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
                  <Form.Item name="inspo_title" label="Inspo title" help="" rules={[{ required: true, type: "string", max: 75 }]} hasFeedback>
                    <Input placeholder="Inspo title" count={{ show: true, max: 75 }} />
                  </Form.Item>
                  <Flex gap="small" align="center" style={{ marginBottom: 24 }}>
                    <Form.Item name="clickbait" rules={[]} style={{ margin: 0 }}>
                      <Switch />
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
                    <Switch />
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

        <Form.Item
          name="writing_mode"
          label={<Label name="Writing style" />}
          rules={[{ required: true }]}
        >
          <Segmented options={[{ label: "Manual", value: "manual" }, { label: "Custom", value: "custom" }]} style={{ width: "fit-content" }} />
        </Form.Item>

        <Form.Item
          shouldUpdate={(prevValues, currentValues) => {
            return prevValues.writing_mode !== currentValues.writing_mode || prevValues.writing_style_id !== currentValues.writing_style_id
          }}
        >
          {({ getFieldValue }) => {
            if (getFieldValue('writing_mode') === "custom") {
              const customWritingStyle = writingStyles?.data?.filter((i) => i.id === fieldCustomWritingId)?.[0];
              const characteristics = fieldCustomWritingId ? compact([
                customWritingStyle.tones,
                customWritingStyle.purposes,
                customWritingStyle.emotions,
                customWritingStyle.vocabularies,
                customWritingStyle.sentence_structures,
                customWritingStyle.perspectives,
                customWritingStyle.writing_structures,
                customWritingStyle.instructional_elements,
              ].flat()) : [];

              return (
                <>
                  <Form.Item
                    name="writing_style_id"
                    validateTrigger="onBlur" rules={[{ required: true, type: "number", message: "Select a writing style" }]}
                    hasFeedback
                  >
                    <Select
                      placeholder="Select a writing style"
                      options={writingStyles?.data?.map(i => ({
                        value: i.id,
                        label: i.name,
                      }))}
                      maxTagCount="responsive"
                      maxLength={5}
                    />
                  </Form.Item>

                  {fieldCustomWritingId && characteristics.map((item, index) => {
                    return (
                      <Tag key={`${item}-${index}`} style={{ marginBottom: 3 }}>{item}</Tag>
                    )
                  })}
                </>
              )
            }

            return (
              <>
                <Form.Item name="tones" label={<Label name="Tones" />} validateTrigger="onBlur" rules={[{ type: "array", message: "Select at least a tone" }]} hasFeedback>
                  <MultiSelectTagList
                    field="tones"
                    options={tones}
                    selectedOptions={fieldTones}
                    onAddTag={onAddTag}
                  />
                </Form.Item>
                <Form.Item name="purposes" label={<Label name="Purposes" />} validateTrigger="onBlur" rules={[{ type: "array", message: "Select at least a tone" }]} hasFeedback>
                  <MultiSelectTagList
                    field="purposes"
                    options={purposes}
                    selectedOptions={fieldPurposes}
                    onAddTag={onAddTag}
                  />
                </Form.Item>
                <Form.Item name="emotions" label={<Label name="Emotions" />} validateTrigger="onBlur" rules={[{ type: "array", message: "Select at least a tone" }]} hasFeedback>
                  <MultiSelectTagList
                    field="emotions"
                    options={emotions}
                    selectedOptions={fieldEmotions}
                    onAddTag={onAddTag}
                  />
                </Form.Item>
                <Form.Item name="vocabularies" label={<Label name="Vocabularies" />} validateTrigger="onBlur" rules={[{ type: "array", message: "Select at least a tone" }]} hasFeedback>
                  <MultiSelectTagList
                    field="vocabularies"
                    options={vocabularies}
                    selectedOptions={fieldVocabularies}
                    onAddTag={onAddTag}
                  />
                </Form.Item>
                <Form.Item name="sentence_structures" label={<Label name="Sentence sturctures" />} validateTrigger="onBlur" rules={[{ type: "array", message: "Select at least a tone" }]} hasFeedback>
                  <MultiSelectTagList
                    field="sentence_structures"
                    options={sentenceStructures}
                    selectedOptions={fieldSentenceStructures}
                    onAddTag={onAddTag}
                  />
                </Form.Item>
                <Form.Item name="perspectives" label={<Label name="Perspectives" />} validateTrigger="onBlur" rules={[{ type: "array", message: "Select at least a tone" }]} hasFeedback>
                  <MultiSelectTagList
                    field="perspectives"
                    options={perspectives}
                    selectedOptions={fieldPerspectives}
                    onAddTag={onAddTag}
                  />
                </Form.Item>
                <Form.Item name="writing_structures" label={<Label name="Writing structures" />} validateTrigger="onBlur" rules={[{ type: "array", message: "Select at least a tone" }]} hasFeedback>
                  <MultiSelectTagList
                    field="writing_structures"
                    options={writingStructures}
                    selectedOptions={fieldWritingStructures}
                    onAddTag={onAddTag}
                  />
                </Form.Item>
                <Form.Item name="instructional_elements" label={<Label name="Instructional elements" />} validateTrigger="onBlur" rules={[{ type: "array", message: "Select at least a tone" }]} hasFeedback>
                  <MultiSelectTagList
                    field="instructional_elements"
                    options={instructionalElements}
                    selectedOptions={fieldInstructionalElements}
                    onAddTag={onAddTag}
                  />
                </Form.Item>

                <Form.Item>
                  <Flex justify="end">
                    <Button
                      type="default"
                      disabled={isEmpty([
                        fieldTones,
                        fieldPurposes,
                        fieldEmotions,
                        fieldVocabularies,
                        fieldSentenceStructures,
                        fieldPerspectives,
                        fieldWritingStructures,
                        fieldInstructionalElements,
                      ].flat())}
                      onClick={() => setIsWritingStyleModalOpened(true)}
                    >
                      Save writing style
                    </Button>
                  </Flex>
                </Form.Item>
              </>
            )
          }}
        </Form.Item>

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

        <Flex vertical gap="small" style={{ marginBottom: 24 }}>
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
          >
            <Input placeholder="Sitemap url" />
          </Form.Item>

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

        <Flex gap="small" align="center" style={{ marginBottom: 12 }}>
          <Form.Item name="with_hook" tooltip="Short sentence that comes before the introduction, its goal is to capture the reader's attention and encourage them to continue reading." rules={[]} style={{ margin: 0 }}>
            <Switch />
          </Form.Item>
          <span>Include hook</span>
        </Flex>

        <Flex gap="small" align="center" style={{ marginBottom: 12, marginTop: 12 }}>
          <Form.Item name="with_introduction" rules={[]} style={{ margin: 0 }}>
            <Switch />
          </Form.Item>
          <span>Introduction</span>
        </Flex>

        <Flex gap="small" align="center" style={{ marginBottom: 12 }}>
          <Form.Item name="with_conclusion" rules={[]} style={{ margin: 0 }}>
            <Switch />
          </Form.Item>
          <span>Conclusion</span>
        </Flex>

        <Flex gap="small" align="center" style={{ marginBottom: 12 }}>
          <Form.Item name="with_key_takeways" rules={[]} style={{ margin: 0 }}>
            <Switch />
          </Form.Item>
          <span>Key takeways</span>
        </Flex>

        <Flex gap="small" align="center" style={{ marginBottom: 12 }}>
          <Form.Item name="with_faq" rules={[]} style={{ margin: 0 }}>
            <Switch />
          </Form.Item>
          <span>FAQ</span>
        </Flex>

        <Flex vertical>
          <Flex gap="small" align="center" style={{ marginBottom: 12 }}>
            <Form.Item name="with_featured_image" rules={[]} style={{ margin: 0 }}>
              <Switch />
            </Form.Item>
            <span>Include featured image</span>
          </Flex>

          {/* <Flex gap="small" align="center" style={{ marginBottom: 12 }}>
          <Form.Item name="with_table_of_content" rules={[]} style={{ margin: 0 }}>
            <Switch />
          </Form.Item>
          <span>Table of content</span>
        </Flex> */}

          <Flex gap="small" align="center" style={{ marginBottom: 12 }}>
            <Form.Item name="with_sections_image" style={{ margin: 0 }}>
              <Switch />
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
                    <Segmented options={['Unsplash', 'Pexels', { label: 'iStock Photo', value: "istock", icon: <StarOutlined twoToneColor="#ffec3d" /> }]} style={{ width: "fit-content" }} />
                  </Form.Item>
                </>
              ) : null

            }}
          </Form.Item>

          {/* <Flex gap="small" align="center">
          <Form.Item name="with_seo" rules={[]} style={{ margin: 0 }}>
            <Switch />
          </Form.Item>
          <span>SEO tags & Schema markups</span>
        </Flex> */}

          <Form.Item style={{ marginBottom: 0 }}>
            <Flex justify="end" align="end" gap="middle">
              {/* <ShowCoinsForAction value="0.10" /> */}
              <Button
                disabled={submittingStep === 0 || !submittingStep && isLocked && false}
                type="primary" onClick={() => form.submit()}
                loading={submittingStep === 0}
              >
                {submittingStep === 0 || lockedStep === 0 ? "Next" : "Get headline ideas (3 credits)"}
              </Button>
            </Flex>
          </Form.Item>
        </Flex>
      </Form>
    </>
  )
}

export default SettingsForm;