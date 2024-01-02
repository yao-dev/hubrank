'use client';
import {
  ActionIcon,
  Affix,
  Badge,
  Button,
  Card,
  Checkbox,
  Flex,
  Grid,
  Group,
  LoadingOverlay,
  Menu,
  Modal,
  MultiSelect,
  SegmentedControl,
  Select,
  Stepper,
  TagsInput,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { IconPencil, IconExternalLink, IconX, IconCheck, IconTrash, IconArrowsUpDown } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import {
  callToActions,
  wordsCounts,
  contentTypes,
  languages,
  purposes,
  tones,
  headingsCount,
  medias,
} from "../../options";
import { randomId } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import axios from "axios";
import { notifications } from "@mantine/notifications";
import { urlRegex } from "@/constants";
import supabase from "@/helpers/supabase";
import KeywordExplorer from "@/components/KeywordExplorer/KeywordExplorer";
import { useRouter } from "next/navigation";
import useTargetAudiences from "@/hooks/useTargetAudiences";
import { useQuery } from "@tanstack/react-query";
import { getUserId } from "@/helpers/user";
import useTopicClusters from "@/hooks/useTopicClusters";
import useBlogPosts from "@/hooks/useBlogPosts";

const notifyError = (e?: any) => {
  if (e) {
    console.error(e)
  }
  notifications.show({
    message: 'Something went wrong, please try again.',
    color: 'red',
    loading: false,
    icon: <IconX size="1rem" />,
    autoClose: 3000,
  })
}

const getKeywordResearch = ({ keyword, countryCode }: any) => {
  return axios.post('/api/keywords-research', { keyword, countryCode })
}

const EditNewArticleForm = ({ articleId }: { articleId: number }) => {
  const router = useRouter()
  const [selectedHeadline, setSelectedHeadline] = useState("");
  const [step, setStep] = useState(1);
  const [stepLoading, setStepLoading] = useState<number | null>(null);
  const [editingIds, setEditingIds] = useState<number[]>([]);
  const [selectedOutlineIndex, setSelectedOutlineIndex] = useState();
  const [outlines, setOutlines] = useState([])
  const [isKeywordExplorerOpen, setIsKeywordExplorerOpen] = useState<boolean | null>(false);
  const [createAnotherArticle, setCreateAnotherArticle] = useState(false);
  const [lockedStep, setLockedStep] = useState<{ articleSettings?: boolean; selectHeadline?: boolean }>({
    articleSettings: true,
    selectHeadline: true
  });
  const { data: audiences } = useTargetAudiences().getAll({ page: 1 });
  const { data: topics } = useTopicClusters().getAll({ page: 1 });
  const { data: article } = useBlogPosts().getOne(articleId)

  const form = useForm({
    validateInputOnBlur: true,
    validateInputOnChange: true,
    initialValues: {
      topic: "",
      language: "",
      target_audience: "",
      content_type: "",
      purpose: "",
      tones: [],
      clickbait: 'no',
      additional_information: "",
      headings: [],
      headingsCount: 3
    },
    validate: (values) => {
      if (step === 0) {
        return {
          topic: !values.topic ? "Select a topic" : null,
          language: !values.language ? "Select a language" : null,
          content_type: !values.content_type ? "Select a content type" : null,
          purpose: !values.purpose ? "Select a purpose" : null,
          tones: !values.tones.length ? "Select at least one tone" : null,
          target_audience: !values.target_audience ? "Select an audience" : null,
          additional_information: values.additional_information?.length > 150 ? "Must be under 150 characters" : null,
        }
      }

      if (step === 2) {
        return {
          headings: values.headings.map((i) => {
            return {
              heading: !i.heading?.trim?.().length ? "Heading can't be empty" : null,
              external_links: i.external_links.some((link: string) => {
                return !urlRegex.test(link)
              }) ? 'Please enter valid urls' : null
            }
          })
        }
      }
      return {}
    },
  });

  useEffect(() => {
    if (article) {
      form.setValues({
        topic: article.topic,
        language: article.language,
        target_audience: article.target_audience,
        content_type: article.content_type,
        purpose: article.purpose,
        tones: article.tones,
        clickbait: article.clickbait,
        additional_information: article.additional_information,
      });
      setSelectedHeadline(article.headline)
    }
  }, [article])

  const { data: keywordsData } = useQuery({
    // enabled: stepLoading === 0,
    enabled: false,
    queryKey: ["keywords", form.values.topic],
    queryFn: () => getKeywordResearch({ keyword: form.values.topic, countryCode: languages.find(i => i.value === form.values.language)?.language_code }),
    // onSuccess(data) {

    // },
  });

  const foundKeywords = useMemo(() => {
    const result = keywordsData?.data?.result || []
    return result.map(i => ({
      value: i.keyword,
      label: `${i.keyword} | vol: ${i.search_volume || 0} | comp: ${i.competition || 0}`
    }))
  }, [keywordsData]);

  const onPreviousStep = () => {
    setStep(step - 1);
  }

  const onGenerateOutline = async () => {
    try {
      setStepLoading(2);
      const response = await axios.post('/api/heading-ideas', {
        topic: form.values.topic,
        tones: form.values.tones,
        headline: selectedHeadline,
        count: form.values.headingsCount,
        language: form.values.language
      })
      setLockedStep(prev => ({ ...prev, selectHeadline: true }));
      const generatedOutline = response?.data?.headings || [];
      setOutlines(prev => [...prev, generatedOutline])
    } catch (e) {
      notifyError(e)
    } finally {
      setStepLoading(null);
    }
  }

  const onSubmitOutline = () => {
    setStep(2)
  }

  const onGenerateArticle = async () => {
    try {
      setStepLoading(2)
      await supabase.from('blog_posts')
        .update({
          headline: selectedHeadline,
          headings: form.values.headings,
          status: 'writing'
        })
        .eq('id', articleId)
        .throwOnError()

      const user_id = await getUserId();
      await supabase.from('blog_posts_headings').insert(
        form.values.headings.map((item, itemIndex) => {
          return {
            blog_post_id: articleId,
            order: itemIndex,
            heading: item.heading,
            words_count: item.words_count,
            media: item.media,
            call_to_action: item.call_to_action,
            keywords: item.keywords,
            external_links: item.external_links,
            user_id
          }
        })
      )
        .throwOnError()

      notifications.show({
        message: "You'll receive a notification when the article is ready",
        autoClose: 6000,
        withCloseButton: true,
        color: "blue",
      })

      if (createAnotherArticle) {
        onRestartArticle()
      } else {
        router.push("?tab=articles")
      }
    } catch (e) {
      notifyError(e)
      setStepLoading(null)
    }
  }

  const onRestartArticle = () => {
    setStep(0)
    setStepLoading(null)
    setEditingIds([])
    setSelectedOutlineIndex(undefined)
    setOutlines([])
    setIsKeywordExplorerOpen(null)
    setSelectedHeadline("");
    setCreateAnotherArticle(false);
    setLockedStep({})
    form.reset()
    router.push("?tab=articles&mode=create")
  }

  const renderCancelButton = () => {
    return (
      <Button
        onClick={() => router.push("?tab=articles")}
        variant="transparent"
        disabled={stepLoading !== null}
      >
        Cancel
      </Button>
    )
  }

  return (
    <div style={{ position: "relative" }}>
      <LoadingOverlay visible={stepLoading !== null} overlayProps={{ blur: 2 }} />

      <Grid gutter="xl" pb={72}>
        <Grid.Col span={8}>
          <Stepper size="sm" mt="lg" mb="xl" orientation="horizontal" active={step}>
            <Stepper.Step label="Article settings" />
            <Stepper.Step label="Select headline" />
            <Stepper.Step label="Select outline" />
            <Stepper.Step label="Outline settings" />
          </Stepper>

          {step === 0 && (
            <form onSubmit={() => setStep(1)}>
              <Flex direction="column" gap="sm" w="100%">
                <Select
                  label="Topic"
                  placeholder="Select a topic"
                  description="We'll find related keywords"
                  data={topics?.data?.map((i) => i.name) || []}
                  searchable
                  withAsterisk
                  {...form.getInputProps("topic")}
                  disabled={lockedStep.articleSettings}
                />
                <Select
                  label="Target audience"
                  placeholder="Select an audience"
                  data={audiences?.data?.map((i) => {
                    return i.audience
                  }) || []}
                  searchable
                  withAsterisk
                  {...form.getInputProps("target_audience")}
                  disabled={lockedStep.articleSettings}
                />
                <Select
                  label="Content type"
                  placeholder="Select a content type"
                  data={contentTypes}
                  maxDropdownHeight={200}
                  searchable
                  withAsterisk
                  {...form.getInputProps("content_type")}
                  disabled={lockedStep.articleSettings}
                />
                <Select
                  label="Purpose"
                  placeholder="Select a purpose"
                  data={purposes}
                  maxDropdownHeight={200}
                  searchable
                  withAsterisk
                  {...form.getInputProps("purpose")}
                  disabled={lockedStep.articleSettings}
                />
                <MultiSelect
                  label="Tones"
                  placeholder="Select tones"
                  data={tones}
                  withAsterisk
                  searchable
                  {...form.getInputProps("tones")}
                  disabled={lockedStep.articleSettings}
                />

                <Select
                  label="Language"
                  placeholder="Select a language"
                  data={languages}
                  maxDropdownHeight={200}
                  searchable
                  withAsterisk
                  {...form.getInputProps("language")}
                  disabled={lockedStep.articleSettings}
                />
                <Flex direction="column" gap="xs">
                  <Text size="sm" fw={500}>Clickbait</Text>
                  <SegmentedControl
                    transitionDuration={0}
                    defaultValue="no"
                    data={[
                      { label: 'No', value: 'no' },
                      { label: 'Yes', value: 'yes' },
                    ]}
                    {...form.getInputProps("clickbait")}
                    disabled={lockedStep.articleSettings}
                  />
                </Flex>

                <Textarea
                  label="Additional information"
                  placeholder="Anything we should know to make your content better"
                  maxLength={150}
                  minRows={1}
                  maxRows={1}
                  {...form.getInputProps('additional_information')}
                  disabled={lockedStep.articleSettings}
                />
              </Flex>
            </form>
          )}
          {step > 0 && (
            <Text size="lg" fw="bold" mb="sm">{selectedHeadline}</Text>
          )}
          {step === 1 && (
            <Flex direction="column" gap="sm" w="100%">
              <Select
                label="Outline sub-headings?"
                data={headingsCount}
                maxDropdownHeight={200}
                {...form.getInputProps("headingsCount")}
              />
              <Group justify='flex-end'>
                <Button
                  onClick={onGenerateOutline}
                >
                  Generate outline
                </Button>
              </Group>

              {outlines.map((outline, outlineIndex) => {
                const isSelected = outlineIndex === selectedOutlineIndex;
                const variant = isSelected ? "filled" : "subtle";
                const copy = isSelected ? "Selected" : "Select this outline";
                const color = isSelected ? "green" : undefined;
                const icon = isSelected ? <IconCheck /> : undefined;
                return (
                  <Card key={outlineIndex} withBorder padding="lg">
                    <Flex direction="column" gap="sm">
                      {outline.map((subHeading, subHeadingIndex) => {
                        return (
                          <Text size="xs" key={subHeadingIndex}>{subHeading}</Text>
                        )
                      })}
                      <Group justify='flex-end'>
                        <Button
                          onClick={() => {
                            setSelectedOutlineIndex(outlineIndex);
                            form.setFieldValue('headings', []);
                            outline.forEach((i, idx) => {
                              form.insertListItem('headings', {
                                id: randomId(),
                                heading: i,
                                words_count: 'auto',
                                media: '',
                                call_to_action: '',
                                call_to_action_instruction: '',
                                keywords: [],
                                external_links: []
                              }, idx)
                            })
                          }}
                          size="compact-xs"
                          variant={variant}
                          color={color}
                          rightSection={icon}
                        >
                          {copy}
                        </Button>
                      </Group>
                    </Flex>
                  </Card>
                )
              })}
            </Flex>
          )}
          {step === 2 && (
            <>
              <Flex direction="column" gap="md">
                {form.values.headings.map((item, headingIndex) => {
                  const cardId = `card-${item.id}`;

                  const scrollToNewPosition = () => {
                    setTimeout(() => {
                      const el = document.getElementById(cardId);
                      window.scrollTo({
                        top: el?.offsetTop,
                        behavior: 'smooth'
                      })
                    }, 50)
                  }

                  return (
                    <Card
                      padding="lg"
                      withBorder
                      key={item.id}
                      id={cardId}
                    >
                      <Flex direction="column" gap="sm" w="100%">
                        <Flex justify="space-between" style={{ cursor: 'pointer' }}>
                          <Flex align="center" gap="sm">
                            <Badge>{headingIndex + 1}</Badge>
                            {(!item.heading || editingIds.includes(item.id)) ? (
                              <Flex align="center" gap="sm">
                                <TextInput
                                  id={item.id}
                                  autoFocus
                                  placeholder="Sub-heading name"
                                  defaultValue={item.heading || ""}
                                  maxLength={50}
                                />
                                <Button
                                  onClick={() => {
                                    setEditingIds(prev => prev.filter(i => i !== item.id));
                                    const el = document.getElementById(item.id);
                                    form.setFieldValue(`headings.${headingIndex}.heading`, el.value)
                                  }}
                                >
                                  Save
                                </Button>
                              </Flex>
                            ) : (
                              <>
                                <Text size="sm" fw="bold">{item.heading}</Text>
                                <ActionIcon
                                  variant="transparent"
                                  onClick={() => {
                                    setEditingIds(prev => {
                                      return [...new Set([...prev, item.id])]
                                    })
                                  }}
                                  size="xs"
                                >
                                  <IconPencil />
                                </ActionIcon>
                              </>
                            )}
                          </Flex>
                          <Flex align="center" gap="lg">
                            <Menu shadow="md">
                              <Menu.Target>
                                <Button variant="subtle" size="compact-sm" rightSection={<IconArrowsUpDown size={14} />}>Move up/down</Button>
                              </Menu.Target>
                              <Menu.Dropdown>
                                {form.values.headings.map((h, idx) => {
                                  let position = idx + 1;
                                  return (
                                    <Menu.Item
                                      key={position}
                                      disabled={idx === headingIndex}
                                      onClick={() => {
                                        form.reorderListItem('headings', { from: headingIndex, to: idx });
                                        scrollToNewPosition()
                                      }}
                                    >
                                      {position}
                                    </Menu.Item>
                                  )
                                })}
                              </Menu.Dropdown>
                            </Menu>

                            <Menu shadow="md" width={200}>
                              <Menu.Target>
                                <ActionIcon
                                  color="red"
                                  variant="transparent"
                                  size="xs"
                                >
                                  <IconTrash size={20} />
                                </ActionIcon>
                              </Menu.Target>
                              <Menu.Dropdown>
                                <Menu.Item
                                  color="red"
                                  onClick={() => {
                                    setEditingIds(prev => prev.filter(i => i !== item.id))
                                    const idx = form.values.headings.findIndex(i => i?.id === item.id);
                                    if (idx !== -1) {
                                      form.removeListItem('headings', headingIndex)
                                    }
                                  }}
                                >
                                  Delete sub-heading
                                </Menu.Item>
                              </Menu.Dropdown>
                            </Menu>
                          </Flex>
                        </Flex>
                        <Select
                          label="Words count"
                          data={wordsCounts}
                          maxDropdownHeight={200}
                          searchable
                          defaultValue="auto"
                          {...form.getInputProps(`headings.${headingIndex}.words_count`)}
                        />
                        <Select
                          label="Include media"
                          description="Our AI will search the internet to find the best media that fits your content"
                          data={medias}
                          maxDropdownHeight={200}
                          searchable
                          {...form.getInputProps(`headings.${headingIndex}.media`)}
                        />
                        {/* <Select
                          label="Call to action"
                          data={callToActions}
                          maxDropdownHeight={200}
                          searchable
                          {...form.getInputProps(`headings.${headingIndex}.call_to_action`)}
                        /> */}
                        {form.values.headings?.[headingIndex]?.call_to_action && (
                          <TextInput
                            label="Instruction"
                            description="Explain how your call to action should be done"
                            maxLength={250}
                            {...form.getInputProps(`headings.${headingIndex}.call_to_action_instruction`)}
                          />
                        )}
                        <Flex direction="column" gap="sm">
                          <TagsInput
                            label="Keywords"
                            description="Press Enter to add a keyword (up to 20)"
                            placeholder="Enter keyword"
                            data={foundKeywords}
                            limit={20}
                            maxTags={20}
                            maxDropdownHeight={200}
                            {...form.getInputProps(`headings.${headingIndex}.keywords`)}
                          />
                          <Group justify='flex-end'>
                            <Button
                              variant="subtle"
                              rightSection={<IconExternalLink size={14} />}
                              size="compact-sm"
                              // onClick={() => setIsKeywordExplorerOpen(headingIndex)}
                              onClick={async () => {
                                try {
                                  setStepLoading(2)
                                  const response = await axios.post('/api/keywords-suggestion', {
                                    article_id: articleId,
                                    user_id: await getUserId(),
                                    heading: item.heading,
                                    query: 'Select 20 of the most suitable keyword for this blog section'
                                  })

                                  form.setFieldValue(`headings.${headingIndex}.keywords`, response.data.keywords.map(i => i.keyword))
                                } catch (e) {
                                  console.error(e)
                                } finally {
                                  setStepLoading(null)
                                }
                              }}
                            >
                              {/* Keyword explorer */}
                              Get suggestion
                            </Button>
                          </Group>
                        </Flex>
                        {/* <TagsInput
                          label="External links"
                          description="Add external links you want to points/redirect to (up to 3)"
                          placeholder="Enter link"
                          maxTags={3}
                          {...form.getInputProps(`headings.${headingIndex}.external_links`)}
                        /> */}
                      </Flex>
                    </Card>
                  )
                })}

                {form.values.headings.length < 10 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newId = randomId();
                      setEditingIds(prev => {
                        return [...new Set([...prev, newId])]
                      })
                      form.insertListItem('headings', {
                        id: randomId(),
                        heading: '',
                        words_count: 'auto',
                        media: '',
                        call_to_action: '',
                        call_to_action_instruction: '',
                        keywords: [],
                        external_links: []
                      })
                    }}
                  >
                    Add heading
                  </Button>
                )}
              </Flex>
            </>
          )}
        </Grid.Col>
      </Grid>

      <Modal size="75%" opened={typeof isKeywordExplorerOpen === "number"} onClose={() => setIsKeywordExplorerOpen(null)} withCloseButton={false} trapFocus={false}>
        <KeywordExplorer
          query={typeof isKeywordExplorerOpen === "number" ? form.values.topic : undefined}
          countryCode={languages.find(i => i.value === form.values.language)?.language_code}
          selection={form.values.headings?.[isKeywordExplorerOpen]?.keywords || "en"}
          onSubmit={values => {
            form.setFieldValue(`headings.${isKeywordExplorerOpen}.keywords`, values)
            setIsKeywordExplorerOpen(false)
          }}
        />
      </Modal>

      <Affix position={{ right: 0, bottom: 0, left: 300 }} style={{ background: "#FFF", borderTop: '1px solid #dee2e6' }}>
        <Flex align="center" justify="space-between" pl="md">
          <Button onClick={onRestartArticle} variant="outline">Restart article</Button>
          <Flex justify='flex-end' p="md" gap="sm">
            {step === 3 && (
              <Checkbox
                label="Create another article"
                onChange={(event) => setCreateAnotherArticle(event.currentTarget.checked)}
              />
            )}

            {renderCancelButton()}

            {step > 0 && (
              <Button
                onClick={onPreviousStep}
                variant="transparent"
                disabled={stepLoading !== null}
              >
                Back
              </Button>
            )}

            {step === 0 && (
              <Button disabled={stepLoading !== null} onClick={() => setStep(1)}>
                Next
              </Button>
            )}

            {step === 1 && (
              <Button
                onClick={onSubmitOutline}
                disabled={typeof selectedOutlineIndex !== "number" || stepLoading !== null}
              >
                Next
              </Button>
            )}

            {step === 2 && (
              <Button
                disabled={stepLoading !== null || form.values.headings.some(i => !i.heading)}
                onClick={onGenerateArticle}
              >
                Generate article
              </Button>
            )}
          </Flex>
        </Flex>
      </Affix>
    </div>
  )
}

export default EditNewArticleForm