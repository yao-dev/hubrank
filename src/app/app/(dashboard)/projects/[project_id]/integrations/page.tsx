'use client';;
import { Button, Dropdown, Modal, Form, Input, message, Select, Tag } from 'antd';
import { brandsLogo } from '@/brands-logo';
import PageTitle from '@/components/PageTitle/PageTitle';
import supabase from '@/helpers/supabase/client';
import useUserId from '@/hooks/useUserId';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import queryKeys from '@/helpers/queryKeys';
import useProjectId from '@/hooks/useProjectId';
import { IconWebhook } from '@tabler/icons-react';
import IntegrationsTable from '@/components/IntegrationsTable/IntegrationsTable';
import { PlusOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import Label from '@/components/Label/Label';
import { capitalize } from 'lodash';
import ModalTitle from '@/components/ModalTitle/ModalTitle';
import { v4 as uuid } from "uuid";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { solarizedDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const GhostIntegrationForm = ({ form, onFinish }) => {
  return (
    <Form
      form={form}
      onFinish={onFinish}
      layout='vertical'
      initialValues={{
        name: "",
        admin_api_key: "",
        api_url: "",
        status: "draft"
      }}
    >
      <Form.Item
        name="name"
        label={<Label name="Name" />}
        rules={[{ required: true, message: 'Name is required' }]}
      >
        <Input placeholder="Name" />
      </Form.Item>
      <Form.Item
        name="admin_api_key"
        label={<Label name="Admin API Key" />}
        rules={[{ required: true, message: 'Admin API Key is required' }]}
      >
        <Input placeholder="Admin API Key" />
      </Form.Item>
      <Form.Item
        name="api_url"
        label={<Label name="API URL" />}
        rules={[{ required: true, message: 'API URL is required', type: "url" }]}
      >
        <Input placeholder="API URL" />
      </Form.Item>

      <Form.Item
        name="status"
        label={<Label name="Status" />}
        rules={[{ required: true, message: 'Status is required' }]}
      >
        <Select
          placeholder="Select a status"
          options={[{ label: "Draft", value: "draft" }, { label: "Published", value: "published" }]}
          optionLabelProp="label"
        />
      </Form.Item>

      <Form.Item>
        <div
          className='relative h-0 w-full rounded-lg'
          style={{
            position: "relative",
            paddingBottom: "calc(57.46527777777778% + 41px)",
            height: 0,
            width: "100%"
          }}
        >
          <iframe
            src="https://demo.arcade.software/wjSykDPRx4mxc6lV8S5W?embed&embed_mobile=inline&embed_desktop=inline&show_copy_link=true"
            title="Hubrank"
            loading="eager"
            allowFullScreen
            allow="clipboard-write"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              colorScheme: "light"
            }}
            className='rounded-lg'
          />
        </div>
      </Form.Item>
    </Form>
  );
};

const ZapierIntegrationForm = ({ form, onFinish }) => {
  return (
    <Form
      form={form}
      onFinish={onFinish}
      layout='vertical'
      initialValues={{
        name: "",
        api_key: uuid()
      }}
      onError={console.log}
    >
      <Form.Item
        name="name"
        label={<Label name="Name" />}
        rules={[{ required: true, message: 'Name is required' }]}
      >
        <Input placeholder="Name" />
      </Form.Item>

      <Form.Item
        hidden
        name="api_key"
      >
        <Input disabled />
      </Form.Item>

      <Form.Item>
        <div
          className='relative h-0 w-full rounded-lg'
          style={{
            position: "relative",
            paddingBottom: "calc(57.46527777777778% + 41px)",
            height: 0,
            width: "100%"
          }}
        >
          <iframe
            src="https://demo.arcade.software/wjSykDPRx4mxc6lV8S5W?embed&embed_mobile=inline&embed_desktop=inline&show_copy_link=true"
            title="Hubrank"
            loading="eager"
            allowFullScreen
            allow="clipboard-write"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              colorScheme: "light"
            }}
            className='rounded-lg'
          />
        </div>
      </Form.Item>
    </Form>
  );
};

const WebhookIntegrationForm = ({ form, onFinish }) => {
  return (
    <Form
      form={form}
      onFinish={onFinish}
      layout='vertical'
      initialValues={{
        name: "",
        webhook: ""
      }}
      onError={console.log}
    >
      <Form.Item
        name="name"
        label={<Label name="Name" />}
        rules={[{ required: true, message: 'Name is required' }]}
      >
        <Input placeholder="Name" />
      </Form.Item>

      <Form.Item
        name="webhook"
        label={<Label name="Webhook url" />}
        rules={[{ required: true, message: 'Webhook url is required', type: "url" }]}
      >
        <Input placeholder="Webhook url" />
      </Form.Item>

      <Form.Item>
        <div className='flex flex-col gap-2'>
          <Tag color="blue" className='w-fit'>POST</Tag>
          <SyntaxHighlighter style={solarizedDark} className="rounded-lg">
            {JSON.stringify({
              "id": 497,
              "created_at": "2024-08-22T03:45:05.232885+00:00",
              "status": "published",
              "html": "<h1>your article html</h1>",
              "markdown": "# your article markdown",
              "title": "SEM vs. SEO: Key Differences Every Marketer Should Know",
              "seed_keyword": "sem vs seo",
              "meta_description": "Understand the key differences between SEO and SEM to boost your business's digital marketing strategy. Explore cost, result time, sustainability, and when to use SEO vs. SEM.",
              "featured_image": "https://images.unsplash.com/photo-1562577309-2592ab84b1bc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w1NDYzMzB8MHwxfHNlYXJjaHwxfHxzZW98ZW58MHx8fHwxNzI0Mjk4MjgxfDA&ixlib=rb-4.0.3&q=85",
              "slug": "sem-vs-seo-key-differences-every-marketer-should-know"
            }, null, 2)}
          </SyntaxHighlighter>
        </div>
      </Form.Item>

      <Form.Item>
        <div
          className='relative h-0 w-full rounded-lg'
          style={{
            position: "relative",
            paddingBottom: "calc(57.46527777777778% + 41px)",
            height: 0,
            width: "100%"
          }}
        >
          <iframe
            src="https://demo.arcade.software/wjSykDPRx4mxc6lV8S5W?embed&embed_mobile=inline&embed_desktop=inline&show_copy_link=true"
            title="Hubrank"
            loading="eager"
            allowFullScreen
            allow="clipboard-write"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              colorScheme: "light"
            }}
            className='rounded-lg'
          />
        </div>
      </Form.Item>
    </Form>
  );
};

const WordpressIntegrationForm = ({ form, onFinish }) => {
  return (
    <Form
      form={form}
      onFinish={onFinish}
      layout='vertical'
      initialValues={{
        name: "",
        url: "",
        username: "",
        password: ""
      }}
    >
      <Form.Item
        name="name"
        label={<Label name="Name" />}
        rules={[{ required: true, message: 'Name is required' }]}
      >
        <Input placeholder="Name" />
      </Form.Item>

      <Form.Item
        name="url"
        label={<Label name="WordPress URL" />}
        rules={[{ required: true, message: 'WordPress URL is required', type: "url" }]}
      >
        <Input placeholder="WordPress URL" />
      </Form.Item>

      <Form.Item
        name="username"
        label={<Label name="WordPress Username" />}
        rules={[{ required: true, message: 'WordPress Username is required' }]}
      >
        <Input placeholder="WordPress Username" />
      </Form.Item>

      <Form.Item
        name="password"
        label={<Label name="WordPress Password" />}
        rules={[{ required: true, message: 'WordPress Password is required' }]}
      >
        <Input.Password placeholder="WordPress Password" />
      </Form.Item>

      <Form.Item>
        <div
          className='relative h-0 w-full rounded-lg'
          style={{
            position: "relative",
            paddingBottom: "calc(57.46527777777778% + 41px)",
            height: 0,
            width: "100%"
          }}
        >
          <iframe
            src="https://demo.arcade.software/wjSykDPRx4mxc6lV8S5W?embed&embed_mobile=inline&embed_desktop=inline&show_copy_link=true"
            title="Hubrank"
            loading="eager"
            allowFullScreen
            allow="clipboard-write"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              colorScheme: "light"
            }}
            className='rounded-lg'
          />
        </div>
      </Form.Item>
    </Form>
  );
};

const ShopifyIntegrationForm = ({ form, onFinish }) => {
  return (
    <Form
      form={form}
      onFinish={onFinish}
      layout='vertical'
      initialValues={{
        name: "",
        api_key: "",
        password: ""
      }}
    >
      <Form.Item
        name="name"
        label={<Label name="Shop Name" />}
        rules={[{ required: true, message: 'Shop Name is required' }]}
      >
        <Input placeholder="Shop Name" />
      </Form.Item>

      <Form.Item
        name="api_key"
        label={<Label name="API Key" />}
        rules={[{ required: true, message: 'API Key is required' }]}
      >
        <Input placeholder="API Key" />
      </Form.Item>

      <Form.Item
        name="password"
        label={<Label name="Password" />}
        rules={[{ required: true, message: 'Password is required' }]}
      >
        <Input.Password placeholder="Password" />
      </Form.Item>

      <Form.Item>
        <div
          className='relative h-0 w-full rounded-lg'
          style={{
            position: "relative",
            paddingBottom: "calc(57.46527777777778% + 41px)",
            height: 0,
            width: "100%"
          }}
        >
          <iframe
            src="https://demo.arcade.software/wjSykDPRx4mxc6lV8S5W?embed&embed_mobile=inline&embed_desktop=inline&show_copy_link=true"
            title="Hubrank"
            loading="eager"
            allowFullScreen
            allow="clipboard-write"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              colorScheme: "light"
            }}
            className='rounded-lg'
          />
        </div>
      </Form.Item>
    </Form>
  );
};

export default function Integrations() {
  const queryClient = useQueryClient();
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const userId = useUserId();
  const projectId = useProjectId();

  const [ghostForm] = Form.useForm();
  const [zapierForm] = Form.useForm();
  const [webhookForm] = Form.useForm();
  const [wordpressForm] = Form.useForm();
  const [shopifyForm] = Form.useForm();

  const { form, FormComponent } = useMemo(() => {
    switch (selectedPlatform) {
      case 'ghost':
        return { form: ghostForm, FormComponent: GhostIntegrationForm };
      case 'zapier':
        return { form: zapierForm, FormComponent: ZapierIntegrationForm };
      case 'webhook':
        return { form: webhookForm, FormComponent: WebhookIntegrationForm };
      case 'wordpress':
        return { form: wordpressForm, FormComponent: WordpressIntegrationForm };
      case 'shopify':
        return { form: shopifyForm, FormComponent: ShopifyIntegrationForm };
      default:
        return {};
    }
  }, [selectedPlatform]);

  const addIntegration = useMutation({
    mutationFn: async ({ name, ...metadata }) => {
      return supabase.from("integrations").insert({ name, platform: selectedPlatform, metadata, user_id: userId, project_id: projectId, enabled: true }).throwOnError()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.integrations({ projectId }),
      });
    },
    onError: () => {
      message.error("We couldn't add your integration please try again.")
    }
  })

  const onFinish = async (values) => {
    await addIntegration.mutateAsync(values);
    form?.resetFields();
    setSelectedPlatform("");
  }

  return (
    <div className='h-full flex flex-col gap-10'>
      <div className='flex flex-row justify-between items-center'>
        <PageTitle title="Integrations" />
        <Dropdown
          menu={{
            items: [
              {
                key: "webhook",
                label: "Webhook",
                icon: <IconWebhook size={20} />,
                onClick: () => setSelectedPlatform("webhook")
              },
              // {
              //   key: "zapier",
              //   label: "Zapier",
              //   icon: <img src={brandsLogo.zapier} width={20} />,
              //   onClick: () => setSelectedPlatform("zapier")
              // },
              {
                key: "wordpress",
                label: "WordPress",
                icon: <img src={brandsLogo.wordpress} width={20} />,
                onClick: () => setSelectedPlatform("wordPress")
              },
              {
                key: "shopify",
                label: "Shopify",
                icon: <img src={brandsLogo.shopify} width={20} />,
                onClick: () => setSelectedPlatform("shopify")
              },
              {
                key: "webflow",
                label: "Webflow",
                icon: <img src={brandsLogo.webflow} width={20} />,
                onClick: () => setSelectedPlatform("webflow")
              },
              // {
              //   key: "wix",
              //   label: "Wix",
              //   icon: <img src={brandsLogo.wix} width={20} />,
              //   onClick: () => setSelectedPlatform("wix")
              // },
              {
                key: "ghost",
                label: "Ghost",
                icon: <img src={brandsLogo.ghost} width={20} />,
                onClick: () => setSelectedPlatform("ghost")
              }
            ],
          }} trigger={['click']}>
          <Button type="primary" icon={<PlusOutlined />}>Integration</Button>
        </Dropdown>
      </div>

      <Modal
        title={<ModalTitle>New {capitalize(selectedPlatform)} integration</ModalTitle>}
        open={!!selectedPlatform}
        style={{ top: 50, left: 100 }}
        onCancel={() => setSelectedPlatform("")}
        okText="Add integration"
        onOk={() => form?.submit()}
        confirmLoading={addIntegration.isPending}
      >
        {FormComponent && (
          <FormComponent
            form={form}
            onFinish={onFinish}
          />
        )}
      </Modal>

      <IntegrationsTable isLoading={addIntegration.isPending} />
    </div>
  )
}