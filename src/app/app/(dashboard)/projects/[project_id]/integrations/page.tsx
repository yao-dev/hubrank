'use client';;
import { Button, Dropdown, Modal, Form, Input, message, Select, Tag, Spin, Image } from 'antd';
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
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import Label from '@/components/Label/Label';
import { capitalize, isEmpty } from 'lodash';
import ModalTitle from '@/components/ModalTitle/ModalTitle';
import { v4 as uuid } from "uuid";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { solarizedDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useRouter } from 'next/navigation';
import WebflowSiteSelect from '@/components/WebflowSiteSelect/WebflowSiteSelect';
import WebflowCollectionSelect from '@/components/WebflowCollectionSelect/WebflowCollectionSelect';
import { getWebflowCollectionItems, getWebflowCollections, getWebflowSites } from '@/app/app/actions';

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

const WebflowIntegrationForm = ({ form, onFinish, initialValues }) => {
  const [isFetchingSites, setIsFetchingSites] = useState(false);
  const [isFetchingCollections, setIsFetchingCollections] = useState(false);
  const [isFetchingItems, setIsFetchingItems] = useState(false);
  const [sites, setSites] = useState<{ label: string | ReactNode; value: string }[]>([]);
  const [collections, setCollections] = useState<{ label: string | ReactNode; value: string }[]>([]);
  const [items, setItems] = useState<{ label: string | ReactNode; value: string }[]>([]);
  const accessToken = Form.useWatch("access_token", form) ?? initialValues?.access_token;
  const siteId = Form.useWatch("site_id", form) ?? initialValues?.site_id;
  const collectionId = Form.useWatch("collection_id", form) ?? initialValues?.collection_id;

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues)
    }
  }, [initialValues]);

  const onFetchSites = async () => {
    try {
      setIsFetchingSites(true)
      const result = await getWebflowSites(accessToken);
      if (result.sites) {
        setSites(result.sites?.map((item) => ({
          label: item.displayName,
          value: item.id
        })))
      }
      setIsFetchingSites(false)
    } catch (e) {
      console.error(e);
      setIsFetchingSites(false)

    }
  }

  const fetchCollections = useCallback(async () => {
    try {
      setIsFetchingCollections(true)
      const result = await getWebflowCollections({ siteId, accessToken });
      if (result.collections) {
        setCollections(result.collections?.map((item) => ({
          label: item.displayName,
          value: item.id
        })))
      }
      setIsFetchingCollections(false)
    } catch (e) {
      console.error(e);
      setIsFetchingCollections(false)

    }
  }, [siteId]);

  const fetchSingleCollection = useCallback(async () => {
    try {
      setIsFetchingItems(true)
      const result = await getWebflowCollectionItems({ collectionId, accessToken });

      if (result?.fields) {
        setItems(result.fields?.map((item) => ({
          ...item,
          label: (
            <div className='flex flex-row items-baseline gap-1'>
              <p className='font-medium'>{item.displayName}</p>
              <p className='text-xs text-gray-400'>({item.type})</p>
            </div>
          ),
          value: item.id,
        })))
      }
      setIsFetchingItems(false)
    } catch (e) {
      console.error(e);
      setIsFetchingItems(false)

    }
  }, [collectionId]);

  useEffect(() => {
    onFetchSites()
  }, [initialValues]);

  useEffect(() => {
    fetchCollections()
  }, [siteId, fetchCollections]);

  useEffect(() => {
    fetchSingleCollection()
  }, [collectionId, fetchSingleCollection]);

  const fieldsArray = [
    { label: "Created At", value: "created_at", type: "DateTime" },
    { label: "True", value: true, type: "Switch" },
    { label: "False", value: false, type: "Switch" },
    { label: "HTML", value: "html", type: "RichText" },
    { label: "Markdown", value: "markdown", type: "RichText" },
    { label: "Title", value: "title", type: "PlainText" },
    { label: "Seed Keyword", value: "seed_keyword", type: "PlainText" },
    { label: "Meta Description", value: "meta_description", type: "PlainText" },
    { label: "Featured Image", value: "featured_image", type: "Image" },
    { label: "Slug", value: "slug", type: "PlainText" },
  ];

  return (
    <Spin spinning={isFetchingSites || isFetchingCollections || isFetchingItems}>
      <Form
        form={form}
        onFinish={onFinish}
        onError={console.log}
        layout='vertical'
        initialValues={{
          name: undefined,
          access_token: "",
          site_id: undefined,
          collection_id: undefined,
          draft: true
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
          name="access_token"
          label={<Label name="Access token" />}
          rules={[{ required: true, message: 'Access token is required' }]}
          className='mb-0'
        >
          <Input placeholder="Access token" />
        </Form.Item>

        <div className='flex flex-row justify-start mt-2 mb-6'>
          <Button
            onClick={onFetchSites}
            loading={isFetchingSites}
            disabled={!accessToken}
          >
            Fetch sites
          </Button>
        </div>

        {!isEmpty(sites) && (
          <Form.Item
            name="site_id"
            label={<Label name="Site" />}
            rules={[{ required: true, message: 'Site is required' }]}
          >
            <WebflowSiteSelect options={sites} />
          </Form.Item>
        )}

        {!isEmpty(collections) && (
          <Form.Item
            name="collection_id"
            label={<Label name="Collection" />}
            rules={[{ required: true, message: 'Collection is required' }]}
          >
            <WebflowCollectionSelect options={collections} />
          </Form.Item>
        )}

        {!isEmpty(items) && (
          <>
            <p className='text-base font-semibold mb-1'>Map fields</p>
            <p className='mb-4 text-gray-500'>Map your Webflow collection with Hubrank's fields</p>

            <div className='grid grid-cols-2 gap-4 mb-6'>
              {items.map((item) => {
                return (
                  <Form.Item
                    key={item.value}
                    label={item.label}
                    className='mb-0'
                    name={`fields.${item.slug}`}
                    required={item.isRequired || item.slug === "post-body"}
                  >
                    <Select
                      placeholder="Select a field"
                      optionLabelProp="label"
                      options={fieldsArray.filter((field) => field.type === item.type)}
                      className='w-full'
                    />
                  </Form.Item>
                )
              })}
            </div>

            <Form.Item
              name="draft"
              label={<Label name="Draft" />}
              rules={[{ required: false }]}
            >
              <Select
                placeholder="Select a status"
                options={[{ label: "True", value: true }, { label: "False", value: false }]}
                optionLabelProp="label"
              />
            </Form.Item>
          </>
        )}

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
    </Spin>
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
              "id": 915,
              "created_at": "2024-08-22T03:45:05.232885+00:00",
              "status": "published",
              "html": "<h1>your html</h1>",
              "markdown": "# your markdown",
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
  const [selectedEditIntegration, setSelectedEditIntegration] = useState()
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const userId = useUserId();
  const projectId = useProjectId();
  const router = useRouter();

  const [ghostForm] = Form.useForm();
  const [zapierForm] = Form.useForm();
  const [webhookForm] = Form.useForm();
  const [wordpressForm] = Form.useForm();
  const [shopifyForm] = Form.useForm();
  const [webflowForm] = Form.useForm();

  const { form, FormComponent } = useMemo(() => {
    const platform = selectedEditIntegration?.platform || selectedPlatform;
    switch (platform) {
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
      case 'webflow':
        return { form: webflowForm, FormComponent: WebflowIntegrationForm };
      default:
        return {};
    }
  }, [selectedEditIntegration, selectedPlatform]);


  useEffect(() => {
    if (form && selectedEditIntegration) {
      setTimeout(() => {
        const initialValues = {
          ...(selectedEditIntegration.metadata ?? {}),
          name: selectedEditIntegration.name ?? "",
        }
        form.setFieldsValue(initialValues)
      }, 750);
    }
  }, [form, selectedEditIntegration])

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

  const updateIntegration = useMutation({
    mutationFn: async ({ name, ...metadata }) => {
      return supabase.from("integrations").update({ name, platform: selectedEditIntegration.platform, metadata }).eq("id", selectedEditIntegration.id).throwOnError()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.integrations({ projectId }),
      });
    },
    onError: () => {
      message.error("We couldn't update your integration please try again.")
    }
  })

  const onFinish = async (values) => {
    if (selectedEditIntegration) {
      await updateIntegration.mutateAsync(values);
    } else {
      await addIntegration.mutateAsync(values);
    }
    form?.resetFields();
    setSelectedPlatform("");
    setSelectedEditIntegration(undefined)
  }

  const onOpenEditMenu = (record: any) => {
    setSelectedEditIntegration(record)
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
              {
                key: "zapier",
                label: "Zapier",
                icon: <img src={brandsLogo.zapier} width={20} />,
                onClick: () => router.push("https://zap.new")
              },
              // {
              //   key: "wordpress",
              //   label: "WordPress",
              //   icon: <img src={brandsLogo.wordpress} width={20} />,
              //   onClick: () => setSelectedPlatform("wordPress")
              // },
              {
                key: "ghost",
                label: "Ghost",
                icon: <img src={brandsLogo.ghost} width={20} />,
                onClick: () => setSelectedPlatform("ghost")
              },
              {
                key: "webflow",
                label: "Webflow",
                icon: <img src={brandsLogo.webflow} width={20} />,
                onClick: () => setSelectedPlatform("webflow")
              },
              // {
              //   key: "shopify",
              //   label: "Shopify",
              //   icon: <img src={brandsLogo.shopify} width={20} />,
              //   onClick: () => setSelectedPlatform("shopify")
              // },
              // {
              //   key: "sanity",
              //   label: "Sanity",
              //   icon: <img src={brandsLogo.sanity} width={20} />,
              //   onClick: () => setSelectedPlatform("sanity")
              // },
              // {
              //   key: "notion",
              //   label: "Notion",
              //   icon: <img src={brandsLogo.notion} width={20} />,
              //   onClick: () => setSelectedPlatform("notion")
              // },
              // {
              //   key: "wix",
              //   label: "Wix",
              //   icon: <img src={brandsLogo.wix} width={20} />,
              //   onClick: () => setSelectedPlatform("wix")
              // },
            ],
          }} trigger={['click']}>
          <Button type="primary" icon={<PlusOutlined />}>Integration</Button>
        </Dropdown>
      </div>

      <Modal
        title={(
          <ModalTitle>
            {(selectedEditIntegration?.platform || selectedPlatform) === "webhook" ? <IconWebhook /> : <Image height={40} src={brandsLogo[selectedEditIntegration?.platform || selectedPlatform]} preview={false} />}
            {selectedEditIntegration ? "Update" : "New"} {capitalize(selectedEditIntegration?.platform || selectedPlatform)} integration
          </ModalTitle>
        )}
        open={!!selectedPlatform || !!selectedEditIntegration}
        style={{ top: 50, left: 100 }}
        onCancel={() => {
          setSelectedPlatform("")
          setSelectedEditIntegration(undefined)
        }}
        okText={selectedEditIntegration ? "Update" : "Add integration"}
        onOk={() => form?.submit()}
        confirmLoading={addIntegration.isPending || addIntegration.isPending}
      >
        {FormComponent && (
          <FormComponent
            form={form}
            onFinish={onFinish}
            initialValues={selectedEditIntegration ? {
              ...(selectedEditIntegration.metadata ?? {}),
              name: selectedEditIntegration.name ?? "",
            } : undefined}
          />
        )}
      </Modal>

      <IntegrationsTable isLoading={addIntegration.isPending || addIntegration.isPending} onOpenEditMenu={onOpenEditMenu} />
    </div>
  )
}