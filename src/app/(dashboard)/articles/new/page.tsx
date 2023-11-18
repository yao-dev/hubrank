'use client';;
import {
  ActionIcon,
  Affix,
  Badge,
  Button,
  Card,
  CheckIcon,
  Checkbox,
  Flex,
  Grid,
  Group,
  LoadingOverlay,
  Menu,
  Modal,
  MultiSelect,
  Radio,
  SegmentedControl,
  Select,
  Stepper,
  TagsInput,
  Text,
  TextInput,
  Textarea,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconChevronDown,
  IconChevronUp,
  IconPencil,
  IconTrash,
  IconExternalLink,
  IconX,
  IconCheck,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { callToActions, wordsCounts, contentTypes, languages, medias, purposes, tones, headingsCount } from "../../../../options";
import { randomId } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import axios from "axios";
import { notifications } from "@mantine/notifications";
import { urlRegex } from "@/constants";
import supabase from "@/helpers/supabase";
import { getUserId } from "@/helpers/user";
import KeywordExplorer from "@/components/KeywordExplorer/KeywordExplorer";
import { useRouter } from "next/navigation";
import useTargetAudiences from "@/hooks/useTargetAudiences";
import { useQuery } from "@tanstack/react-query";

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

export default function NewArticle() {
  const [selectedHeadline, setSelectedHeadline] = useState("");
  const [step, setStep] = useState(0);
  const [stepLoading, setStepLoading] = useState<number | null>(null);
  const [headlines, setHeadlines] = useState([]);
  const [editingIds, setEditingIds] = useState<number[]>([]);
  const [selectedOutlineIndex, setSelectedOutlineIndex] = useState();
  const [outlines, setOutlines] = useState([])
  const [isKeywordExplorerOpen, setIsKeywordExplorerOpen] = useState<boolean | null>(false);
  const [createAnotherArticle, setCreateAnotherArticle] = useState(false);
  const [lockedStep, setLockedStep] = useState<{ articleSettings?: boolean; selectHeadline?: boolean }>({});
  const router = useRouter()
  const { data: targetAudiences } = useTargetAudiences().getAll();

  const form = useForm({
    validateInputOnBlur: true,
    validateInputOnChange: true,
    initialValues: {
      topic: "",
      language: "",
      target_audience: [],
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
          target_audience: !values.target_audience.length ? "Please add a target audience" : values.target_audience.length > 150 ? "Must be under 150 characters" : null,
          additional_information: values.additional_information.length > 150 ? "Must be under 150 characters" : null,
        }
      }

      if (step === 3) {
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

  const { data: keywordsData } = useQuery({
    enabled: !!form.values?.topic?.length,
    queryKey: ["keywords", form.values.topic],
    queryFn: () => axios.post('/api/keywords-research', { keyword: form.values.topic, countryCode: languages.find(i => i.value === form.values.language)?.language_code })
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

  const onSubmitArticleSettings = form.onSubmit(async (values) => {
    if (lockedStep.articleSettings) {
      setStep(1);
    } else {
      try {
        setStepLoading(0);
        console.log(values)
        supabase.from('target_audience').insert({ audience: values.target_audience[0] })
        const headlinesResponse = await axios.post('/api/headline-ideas', {
          topic: values.topic,
          language: values.language,
          content_type: values.content_type,
          purpose: values.purpose,
          tones: values.tones,
          target_audience: values.target_audience,
          clickbait: values.clickbait,
        })
        const headlineIdeas = headlinesResponse?.data?.headlines || []
        setHeadlines(headlineIdeas)
        setStep(1);
        setLockedStep(prev => ({ ...prev, articleSettings: true }));
      } catch (e) {
        notifyError(e)
      } finally {
        setStepLoading(null);
      }
    }
  })

  const onSubmitHeadline = async () => {
    setStep(2);
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
    setStep(3)
  }

  const onGenerateArticle = async () => {
    try {
      console.log(form.values);
      setStepLoading(3)
      const { data: newBlogPost } = await supabase.from('blog_posts')
        .insert({
          user_id: await getUserId(),
          headline: selectedHeadline,
          topic: form.values.topic,
          language: form.values.language,
          content_type: form.values.content_type,
          purpose: form.values.purpose,
          tones: form.values.tones,
          target_audience: form.values.target_audience,
          clickbait: form.values.clickbait,
          additional_information: form.values.additional_information,
          headings: form.values.headings
        })
        .select()
        .single();

      await supabase.from('blog_posts_headings').insert(
        form.values.headings.map((item, itemIndex) => {
          return {
            blog_post_id: newBlogPost.id,
            order: itemIndex,
            heading: item.heading,
            words_count: item.words_count,
            media: item.media,
            call_to_action: item.call_to_action,
            keywords: item.keywords,
            external_links: item.external_links,
          }
        })
      );

      notifications.show({
        message: "You'll receive a notification when the article is ready",
        autoClose: 6000,
        withCloseButton: true,
        color: "blue",
      })

      if (createAnotherArticle) {
        onRestartArticle()
      } else {
        router.replace('/articles')
      }
    } catch (e) {
      notifyError(e)
      setStepLoading(null)
    }
  }

  const onRestartArticle = () => {
    setStep(0)
    setStepLoading(null)
    setHeadlines([])
    setEditingIds([])
    setSelectedOutlineIndex(undefined)
    setOutlines([])
    setIsKeywordExplorerOpen(null)
    setSelectedHeadline("");
    setCreateAnotherArticle(false);
    setLockedStep({})
    form.reset()
  }

  return (
    <div style={{ position: "relative" }}>
      <LoadingOverlay visible={stepLoading !== null} overlayProps={{ blur: 2 }} />

      <Flex mb="xl" align="center" justify="space-between">
        <Title order={2} fw="bold">New article</Title>
        <Button onClick={onRestartArticle} variant="outline">Restart article</Button>
      </Flex>

      <Grid gutter="xl">
        <Grid.Col span={5}>
          {step === 0 && (
            <form onSubmit={onSubmitArticleSettings}>
              <Flex direction="column" gap="sm" w="100%">
                <TextInput
                  withAsterisk
                  label="Topic"
                  placeholder="Enter topic"
                  description="We'll find related keywords"
                  maxLength={25}
                  {...form.getInputProps("topic")}
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
                <TagsInput
                  label="Target audience"
                  placeholder="Who is your ideal audience"
                  description="Press Enter to add your audience"
                  limit={1}
                  maxLength={150}
                  maxTags={1}
                  data={targetAudiences?.map((i) => i.audience) || []}
                  withAsterisk
                  maxDropdownHeight={200}
                  {...form.getInputProps("target_audience")}
                  disabled={lockedStep.articleSettings}
                />
                {/* targetAudiences */}
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

                <Affix position={{ bottom: 20, right: 20 }}>
                  <Button onClick={() => onSubmitArticleSettings()}>
                    Next
                  </Button>
                </Affix>
              </Flex>
            </form>
          )}
          {step === 1 && (
            <Flex direction="column" gap="sm" w="100%">
              <Text size="sm">Select one headline</Text>
              <Radio.Group
                name="headline"
                value={selectedHeadline}
                onChange={setSelectedHeadline}
                labelProps={{
                  fontSize: 24,
                  fontWeight: "bold"
                }}
              >
                {headlines.map((headline, headlineIndex) => {
                  return (
                    <Radio
                      key={headlineIndex}
                      icon={CheckIcon}
                      my="md"
                      label={headline}
                      value={headline}
                      disabled={lockedStep.selectHeadline}
                    />
                  )
                })}
              </Radio.Group>
              <Affix position={{ bottom: 20, right: 20 }}>
                <Flex justify='flex-end' mt="md" gap="sm">
                  <Button
                    onClick={onPreviousStep}
                    variant="transparent"
                    disabled={stepLoading !== null}
                  >
                    Back
                  </Button>
                  <Button onClick={onSubmitHeadline} disabled={!selectedHeadline}>
                    Next
                  </Button>
                </Flex>
              </Affix>
            </Flex>
          )}
          {step > 1 && (
            <Text size="lg" fw="bold" mb="sm">{selectedHeadline}</Text>
          )}
          {step === 2 && (
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
              {/* {headings.map((heading, headingIndex) => {
                  const idx = form.values.headings.findIndex(i => i.heading === heading)
                  const isChecked = idx !== -1;
                  return (
                    <Checkbox
                      key={headingIndex}
                      label={heading}
                      checked={isChecked}
                      disabled={!isChecked && form.values.headings.length > 10}
                      onChange={() => {
                        if (isChecked) {
                          form.removeListItem('headings', idx)
                        } else {
                          form.insertListItem('headings', {
                            id: randomId(),
                            heading,
                            words_count: 'auto',
                            media: '',
                            call_to_action: '',
                            call_to_action_instruction: '',
                            keywords: [],
                            external_links: []
                          }, headingIndex)
                        }
                      }}
                    />
                  )
                })} */}

              <Affix position={{ bottom: 20, right: 20 }}>
                <Flex justify='flex-end' mt="md" gap="sm">
                  <Button
                    onClick={onPreviousStep}
                    type="button"
                    variant="transparent"
                    disabled={stepLoading !== null}
                  >
                    Back
                  </Button>

                  <Button
                    // onClick={onSubmitHeadings}
                    onClick={onSubmitOutline}
                    disabled={typeof selectedOutlineIndex !== "number"}
                  >
                    Next
                  </Button>
                </Flex>
              </Affix>
            </Flex>
          )}
          {step === 3 && (
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
                    }, 1000)
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
                            <Flex align="center">
                              {headingIndex !== 0 && (
                                <Tooltip label="Move up">
                                  <ActionIcon
                                    onClick={() => {
                                      form.reorderListItem('headings', { from: headingIndex, to: headingIndex - 1 });
                                      scrollToNewPosition()
                                    }}
                                    variant="transparent"
                                    size="xs"
                                  >
                                    <IconChevronUp />
                                  </ActionIcon>
                                </Tooltip>
                              )}
                              {headingIndex + 1 !== form.values.headings.length && (
                                <Tooltip label="Move down">
                                  <ActionIcon
                                    onClick={() => {
                                      form.reorderListItem('headings', { from: headingIndex, to: headingIndex + 1 });
                                      scrollToNewPosition()
                                    }}
                                    variant="transparent"
                                    size="xs"
                                  >
                                    <IconChevronDown />
                                  </ActionIcon>
                                </Tooltip>
                              )}
                            </Flex>

                            <Menu shadow="md" width={200}>
                              <Menu.Target>
                                <ActionIcon
                                  color="red"
                                  variant="transparent"
                                  size="xs"
                                >
                                  <IconTrash />
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
                        {/* <Select
                          label="Include media"
                          description="Our AI will search the internet to find the best media that fits your content"
                          data={medias}
                          maxDropdownHeight={200}
                          searchable
                          {...form.getInputProps(`headings.${headingIndex}.media`)}
                        /> */}
                        <Select
                          label="Call to action"
                          data={callToActions}
                          maxDropdownHeight={200}
                          searchable
                          {...form.getInputProps(`headings.${headingIndex}.call_to_action`)}
                        />
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
                            description="Press Enter to add a keyword (up to 10)"
                            placeholder="Enter keyword"
                            data={foundKeywords}
                            limit={20}
                            maxTags={20}
                            maxDropdownHeight={200}
                            {...form.getInputProps(`headings.${headingIndex}.keywords`)}
                          />
                          <Group justify='flex-end'>
                            <Button
                              variant="outline"
                              rightSection={<IconExternalLink size={14} />}
                              size="compact-sm"
                              onClick={() => setIsKeywordExplorerOpen(headingIndex)}
                            >
                              Keyword explorer
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

              <Group align="center" justify='space-between' mt="xl" gap="sm">
                <Checkbox
                  label="Create another article"
                  onChange={(event) => setCreateAnotherArticle(event.currentTarget.checked)}
                />
              </Group>


              <Affix position={{ bottom: 20, right: 20 }}>
                <Flex justify='flex-end' mt="md" gap="sm">
                  <Button
                    onClick={onPreviousStep}
                    variant="transparent"
                    disabled={stepLoading !== null}
                  >
                    Back
                  </Button>

                  <Button
                    disabled={form.values.headings.some(i => !i.heading)}
                    onClick={onGenerateArticle}
                  >
                    Generate article
                  </Button>
                </Flex>
              </Affix>
            </>
          )}
        </Grid.Col>
        <Grid.Col span={3} offset={4}>
          <Stepper size="sm" mt="lg" orientation="vertical" active={step}>
            <Stepper.Step label="Article settings" />
            <Stepper.Step label="Select headline" />
            <Stepper.Step label="Select outline" />
            <Stepper.Step label="Outline settings" />
          </Stepper>
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
    </div>
  )
}