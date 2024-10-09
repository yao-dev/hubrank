'use client';;
import { Card, Button, Switch } from 'antd';
import { brandsLogo } from '@/brands-logo';
import PageTitle from '@/components/PageTitle/PageTitle';
import useIntegrations from '@/hooks/useIntegrations';
import supabase from '@/helpers/supabase/client';
import useUserId from '@/hooks/useUserId';
import { useQueryClient } from '@tanstack/react-query';
import queryKeys from '@/helpers/queryKeys';
import useProjectId from '@/hooks/useProjectId';

export default function Integrations() {
  const userId = useUserId()
  const projectId = useProjectId();
  const { data: integrations } = useIntegrations();
  const hasZapierIntegration = integrations?.some((item) => item.platform === "zapier");
  const hasZapierIntegrationEnabled = integrations?.some((item) => item.platform === "zapier" && item.enabled);
  const queryClient = useQueryClient();

  return (
    <div className='h-full flex flex-col gap-10'>
      <div className='flex flex-row justify-between items-center'>
        <PageTitle title="Integrations" />
      </div>
      <div className='grid grid-cols-4 gap-4'>
        <Card className='rounded-lg'>
          <div className='flex flex-col gap-6'>
            <div className='flex flex-col gap-2'>
              <div className='flex flex-row justify-between items-start'>
                <img src={brandsLogo.zapier} className='w-[75px]' />
                {hasZapierIntegration && (
                  <Switch
                    className='w-fit'
                    value={hasZapierIntegrationEnabled}
                    onChange={async (checked) => {
                      await supabase.from("integrations").update({ enabled: checked }).match({ "user_id": userId, platform: "zapier", project_id: projectId }).throwOnError();
                      queryClient.invalidateQueries({
                        queryKey: queryKeys.integrations({ projectId })
                      })
                    }}
                  />
                )}
              </div>
              <p className='text-xl font-medium'>Zapier</p>
              <p className='text-zinc-500 text-sm'>Build custom automations and integrations with other apps.</p>
            </div>
            <Button href="https://zap.new" target='_blank'>Create a Zap</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}