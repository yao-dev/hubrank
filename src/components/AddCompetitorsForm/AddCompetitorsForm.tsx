'use client';
import { urlRegex } from "@/constants";
import useProjects from "@/hooks/useProjects";
import { ActionIcon, Button, Flex, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { randomId } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconLink, IconMinus, IconPlus, IconX } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import TrainButton from "../TrainButton/TrainButton";
import useProjectId from "@/hooks/useProjectId";
import useCompetitors from "@/hooks/useCompetitors";

const AddCompetitorsForm = () => {
  const projectId = useProjectId();
  const { getCompetitors, addCompetitors, updateCompetitors } = useCompetitors(projectId);
  const { data: competitors } = getCompetitors();
  const [editMode, setEditMode] = useState(false);

  const form = useForm({
    initialValues: {
      urls: []
    },
    validate: {
      urls: (urls) => {
        const errors = urls.filter((item) => {
          return !urlRegex.test(item.value) ? 'Please enter a valid url' : null
        });
        return !!errors.length ? errors : null
      }
    },
    transformValues: (values) => {
      return {
        urls: values.urls.map((item) => {
          let url = item.value || ""
          if (!url.startsWith('https://')) {
            url = `https://${item.value}`
          }
          return new URL(url).origin
        })
      }
    },
  });

  const populate = useCallback(() => {
    form.reset();
    if (competitors?.length) {
      const values = competitors.map((i: any) => ({
        id: i.id,
        value: i.url,
        training: i.training,
        key: randomId()
      }))
      values.forEach((value: any) => form.insertListItem('urls', value))
      form.resetDirty(values);
      setEditMode(false)
    } else if (!form.values.urls.length) {
      form.insertListItem('urls', { value: '', id: null, training: '', key: randomId() })
      setEditMode(true)
    }
  }, [competitors])

  useEffect(() => {
    populate()
  }, [populate])

  const onAddInput = () => {
    form.insertListItem('urls', { value: '', id: null, key: randomId() })
  }

  const onRemoveInput = (index: number) => {
    form.removeListItem('urls', index)
  }

  const onSubmit = form.onSubmit(async (values) => {
    if (!editMode) {
      return;
    }

    try {
      await addCompetitors.mutateAsync(values.urls)
      setEditMode(false);
      notifications.show({
        message: 'Competitors saved',
        color: 'green',
        icon: <IconCheck size="1.2rem" />,
        autoClose: true,
      });
    } catch (e) {
      console.error(e);
      notifications.show({
        message: 'Competitors saved',
        color: 'red',
        icon: <IconX size="1.2rem" />,
        autoClose: true,
      })
    }
  })

  const onTrain = (competitorId: number, status: string) => {
    updateCompetitors.mutate({
      competitorId,
      training: status === 'trained' ? 're-training' : 'training'
    });
  }

  const urls = form.values.urls
  const isTraining = urls.some((i) => ['re-training', 'training'].includes(i?.training || ""));

  return (
    <div>
      <Text mb="xl">Train your <b>Hubrank</b> on your competitors data</Text>
      <form onSubmit={onSubmit}>
        <Flex direction="column" gap="md">
          {urls.map((url: any, index) => {
            const trainButton = (
              <TrainButton
                display={Boolean(competitors?.length && !editMode)}
                status={url.training}
                onClick={() => url.training === 'training' ? undefined : onTrain(url.id, url.training)}
              />
            )
            if (!index) {
              return (
                <Flex key={url.key} direction="row" align="start" gap="md">
                  <TextInput
                    error={form.errors.urls?.[index]}
                    maxLength={50}
                    disabled={!editMode}
                    icon={<IconLink />}
                    style={{ flex: 1 }}
                    {...form.getInputProps(`urls.${index}.value`)}
                  />
                  {editMode && (
                    <ActionIcon variant="outline" size="lg" onClick={() => {
                      if (urls.length === 1) {
                        form.setFieldValue(`urls.${index}.value`, '')
                      } else {
                        onRemoveInput(index)
                      }
                    }}>
                      <IconMinus />
                    </ActionIcon>
                  )}
                  {editMode && urls.length === 1 && (
                    <ActionIcon variant="outline" size="lg" onClick={onAddInput}>
                      <IconPlus />
                    </ActionIcon>
                  )}
                  {trainButton}
                </Flex>
              )
            }

            return (
              <Flex key={url.key} direction="row" align="start" gap="md">
                <TextInput
                  error={form.errors.urls?.[index]}
                  maxLength={50}
                  disabled={!editMode}
                  icon={<IconLink />}
                  style={{ flex: 1 }}
                  {...form.getInputProps(`urls.${index}.value`)}
                />
                {editMode && (
                  <ActionIcon variant="outline" size="lg" onClick={() => onRemoveInput(index)}>
                    <IconMinus />
                  </ActionIcon>
                )}
                {editMode && urls.length - 1 === index && urls.length < 10 && (
                  <ActionIcon variant="outline" size="lg" onClick={onAddInput}>
                    <IconPlus />
                  </ActionIcon>
                )}
                {trainButton}
              </Flex>
            )
          })}

          {editMode ? (
            <Flex gap="md" align="center" justify="flex-end">
              {!!competitors?.length && (
                <Button variant="outline" onClick={() => {
                  setEditMode(false);
                  populate();
                }}>
                  Cancel
                </Button>
              )}
              <Button type="submit" loading={addCompetitors.isLoading}>
                Save
              </Button>
            </Flex>
          ) : (
            <Button disabled={isTraining} onClick={() => isTraining ? undefined : setEditMode(true)} style={{ alignSelf: 'flex-end' }}>
              Edit
            </Button>
          )}
        </Flex>
      </form>
    </div >
  )
}

export default AddCompetitorsForm