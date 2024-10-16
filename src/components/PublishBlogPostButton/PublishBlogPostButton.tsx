'use client';;
import useBlogPosts from '@/hooks/useBlogPosts';
import { Button, Dropdown, Image, MenuProps } from 'antd';
import { isEmpty } from 'lodash';
import { IconSend, IconWebhook } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import useProjectId from '@/hooks/useProjectId';
import useIntegrations from '@/hooks/useIntegrations';
import { brandsLogo } from '@/brands-logo';
import queryKeys from '@/helpers/queryKeys';

const PublishBlogPostButton = ({ id, disabled }) => {
  const projectId = useProjectId()
  const { getOne, update: updateBlogPost } = useBlogPosts();
  const { data: article } = getOne(id)
  const queryClient = useQueryClient();
  const { data: integrations } = useIntegrations({ enabled: true });
  const hasIntegrations = !isEmpty(integrations);

  const items: MenuProps['items'] = integrations?.map((item) => {
    return {
      label: (
        <div className='flex flex-row items-center gap-4'>
          {item.platform === "webhook" ? (
            <IconWebhook />
          ) : (
            <Image
              src={brandsLogo[item.platform]}
              width={25}
              height={25}
              preview={false}
            />
          )}
          {item.name}
        </div>
      ),
      key: `${item.id}`,
      onClick: () => {
        updateBlogPost.mutate({ id: article.id, status: "publishing", integration_id: item.id });
        queryClient.invalidateQueries({
          queryKey: queryKeys.blogPosts(projectId)
        });
      },
    }
  })

  if (!hasIntegrations) return null;

  return (
    <Dropdown menu={{ items }} trigger={['click']} disabled={disabled}>
      <Button
        icon={<IconSend size={18} />}
        className='w-fit flex flex-row items-center'
        disabled={!["ready_to_view", "published"].includes(article?.status)}
      >
        Publish
      </Button>
    </Dropdown>
  )
}

export default PublishBlogPostButton