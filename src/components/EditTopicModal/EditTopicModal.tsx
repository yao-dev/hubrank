import React from "react";
import { Modal, Group, Button, TextInput, LoadingOverlay, Text } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';

type EditTopicModalProps = {
  opened: boolean;
  isLoading: boolean;
  error: boolean;
  onClose: () => void;
  onSubmit: () => void;
  form: UseFormReturnType<{
    name: string;
  }, (values: {
    name: string;
  }) => {
    name: string;
  }>
}

const EditTopicModal = ({
  opened,
  onClose,
  isLoading,
  onSubmit,
  form,
}: EditTopicModalProps) => {
  return (
    <Modal opened={opened} onClose={onClose} withCloseButton={false} trapFocus={false}>
      <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2 }} />
      <form onSubmit={onSubmit}>
        <Text size="xl" fw="bold">Edit topic cluster</Text>
        <TextInput
          label="Name"
          placeholder="Name"
          withAsterisk
          {...form.getInputProps('name')}
        />
        <Group justify="flex-end" mt="md">
          <Button type="submit">Save</Button>
        </Group>
      </form>
    </Modal>
  )
}

export default EditTopicModal