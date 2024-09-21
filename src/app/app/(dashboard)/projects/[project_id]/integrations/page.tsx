'use client';;
import { Card, Button, Switch } from 'antd';
import { brandsLogo } from '@/brands-logo';
import PageTitle from '@/components/PageTitle/PageTitle';
import useIntegrations from '@/hooks/useIntegrations';


export default function Integrations() {
  // const [hover, setHover] = useState("")
  // const [selectedIntegration, setSelectedIntegration] = useState("")
  const { data: integrations } = useIntegrations();
  const hasZapierIntegration = integrations?.some((item) => item.platform === "zapier");

  return (
    <>
      {/* <Modal
        title="New integration"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        okText="Add integration"
        okButtonProps={{
          disabled: !selectedIntegration
        }}
        style={{ top: 20 }}
        width={700}
      >
        <Row>
          {Object.keys(brandsLogo).map((brandName) => {
            return (
              <Col key={brandName} style={{ width: "31%", margin: 5, overflow: "hidden" }} onMouseEnter={() => setHover(brandName)} onMouseLeave={() => setHover("")}>
                <Card
                  style={{
                    height: 125,
                    display: "flex",
                    borderColor: [hover, selectedIntegration].includes(brandName) ? "rgb(93 95 239)" : undefined,
                    borderWidth: [hover, selectedIntegration].includes(brandName) ? 3 : 1,
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer"
                  }}
                  onClick={() => setSelectedIntegration(brandName)}
                >
                  <Image width={100} src={brandsLogo[brandName]} preview={false} />
                </Card>
              </Col>
            )
          })}
        </Row>
      </Modal> */}
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
                  <Switch
                    className='w-fit'
                    value={hasZapierIntegration}
                    onChange={checked => {
                      if (false) {
                        // TODO: delete zapier integration and webhook subscriptions
                      }
                    }}
                  />
                </div>
                <p className='text-xl font-medium'>Zapier</p>
                <p className='text-zinc-500 text-sm'>Build custom automations and integrations with other apps.</p>
              </div>
              <Button href="https://zap.new" target='_blank'>Create a Zap</Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}