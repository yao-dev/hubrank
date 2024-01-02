import { Modal, Group, Button, TextInput, LoadingOverlay, Flex, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import useActiveProject from '@/hooks/useActiveProject';
import useModal from '@/hooks/useModal';
import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import useTargetAudiences from '@/hooks/useTargetAudiences';

const NewAudienceModal = () => {
  const modal = useModal();
  const activeProjectId = useActiveProject().id;
  const targetAudiences = useTargetAudiences();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter()
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const onClose = () => {
    const params = new URLSearchParams(searchParams)
    if (params.get("tab") === "topics") {
      params.delete("mode");
    }
    router.push(`${pathname}?${params.toString()}`)
    modal.close("create_audience");
    setIsLoading(false);
    form?.reset?.()
  }

  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    if (!params.has("mode")) {
      onClose()
    }
  }, [searchParams])

  const form = useForm({
    initialValues: {
      audience: '',
    },
    validate: {
      audience: (value: string) => !value || value.trim().length > 50 ? 'Name must be 50 characters or less' : null,
    }
  });

  const onCreateTargetAudience = form.onSubmit(async (values: any) => {
    setIsLoading(true)
    try {
      await targetAudiences.create.mutateAsync(values.audience);
      onClose();
    } catch {
      setIsLoading(false)
      return;
    }
  })



  return (
    <Modal opened={modal.create_audience} onClose={isLoading ? () => { } : onClose} withCloseButton={false} trapFocus={false}>
      <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2 }} />
      <form onSubmit={onCreateTargetAudience}>
        <Flex direction="column" gap="md">
          <Text size="xl" fw="bold">New target audience</Text>
          <TextInput
            label="Audience"
            placeholder="Audience"
            withAsterisk
            {...form.getInputProps('audience')}
          />
          <Group justify="flex-end" mt="md">
            <Button type="submit" loading={isLoading}>Save</Button>
          </Group>
        </Flex>
      </form>
    </Modal>
  )
}

export default NewAudienceModal