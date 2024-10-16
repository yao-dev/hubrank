'use client';;
import { Button, Dropdown, Modal, Form, Input, message, Select } from 'antd';
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
import prettify from "pretty";

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
        <SyntaxHighlighter style={solarizedDark}>
          {prettify(`{
  "id": 497,
  "created_at": "2024-08-22T03:45:05.232885+00:00",
  "status": "published",
  "html": "<p><img class=\"rounded-lg m-0 w-full\" src=\"https://images.unsplash.com/photo-1562577309-2592ab84b1bc?crop=entropy&amp;cs=srgb&amp;fm=jpg&amp;ixid=M3w1NDYzMzB8MHwxfHNlYXJjaHwxfHxzZW98ZW58MHx8fHwxNzI0Mjk4MjgxfDA&amp;ixlib=rb-4.0.3&amp;q=85\" alt=\"featured image\"></p><h2>Contents</h2><ul><li><p><a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"#what-is-seo\">What is SEO?</a></p></li><li><p><a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"#what-is-sem\">What is SEM?</a></p></li><li><p><a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"#key-differences-between-seo-and-sem\">Key Differences Between SEO and SEM</a></p><ul><li><p><a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"#cost\">Cost</a></p></li><li><p><a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"#time-to-see-results\">Time to See Results</a></p></li><li><p><a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"#sustainability\">Sustainability</a></p></li></ul></li><li><p><a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"#when-to-use-seo-vs-sem\">When to Use SEO vs. SEM</a></p></li><li><p><a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"#how-seo-and-sem-work-together\">How SEO and SEM Work Together</a></p></li></ul><h2>What is SEO?</h2><p><strong>Search Engine Optimization (SEO)</strong> refers to the practice of enhancing a website to improve its visibility on search engine results pages (SERPs). It involves optimizing content, structure, and technical aspects to rank higher for relevant keywords. SEO aims to attract organic traffic through unpaid search results. Key components include keyword research, on-page optimization, and <a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"https://usehubrank.com/glossary/technical-seo\">technical SEO</a>. Regular <a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"https://usehubrank.com/glossary/seo-audit\">SEO audits</a> ensure the website adheres to best practices. Effective SEO requires understanding search algorithms and user intent to deliver valuable, relevant <a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"https://google.com\">content</a>.</p><h2>What is SEM?</h2><p>Search Engine Marketing, often referred to as <strong>SEM</strong>, is a digital marketing strategy used to increase the visibility of a website in search engine results pages (<a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"https://usehubrank.com/glossary/serp\">SERPs</a>). While similar to SEO, SEM often involves paid tactics like pay-per-click (PPC) advertising or cost-per-click (CPC) advertising.</p><p>The goal of SEM is to promote websites by increasing their visibility in search engine results pages primarily through paid advertising. It aims to improve <a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"https://usehubrank.com/glossary/serp-ranking\">SERP rankings</a> and increase <a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"https://usehubrank.com/glossary/search-volume\">search volume</a> to attract more visitors.</p><p>Remember, effective SEM strategies can provide a business with improved visibility, more web traffic, and a higher search ranking.</p><p></p><h2>Key Differences Between SEO and SEM</h2><p>While both SEO and SEM strategies aim to increase visibility in search engines, there are significant differences between the two. Understanding these differences can help marketers make informed decisions about their digital marketing strategies.</p><p><img class=\"rounded-lg m-0 w-full\" src=\"https://images.unsplash.com/photo-1624555130581-1d9cca783bc0?crop=entropy&amp;cs=srgb&amp;fm=jpg&amp;ixid=M3w1NDYzMzB8MHwxfHNlYXJjaHw0fHxzZW98ZW58MHx8fHwxNzI3OTc4NDI0fDA&amp;ixlib=rb-4.0.3&amp;q=85\" alt=\"people sitting at the table\"></p><h3>Cost</h3><p>One of the main differences between SEO and SEM is the cost. SEO is a long-term strategy that involves optimizing your website to rank higher in search engine results. This can be done organically, meaning it doesn't require a direct cost. On the other hand, SEM involves paying for ads to appear in search engine results, which can be more costly.</p><h3>Visibility</h3><p>Another key difference is visibility. SEM can provide immediate visibility on search engines, as ads can be set up and live within a day. SEO, however, requires time and consistent effort to build ranking and visibility.</p><h3>Targeting</h3><p>Both SEO and SEM allow for targeting, but in different ways. With SEO, you can target specific keywords in your content to rank for. With SEM, you can target specific demographics, locations, and even times of day for your ads to appear.</p><h3>Results</h3><p>Finally, the results from SEO and SEM can be different. SEM can provide immediate results, but once you stop paying for ads, your visibility can decrease. SEO results take longer to achieve, but they can provide lasting visibility and ranking.</p><p>In conclusion, while there are similarities between SEO and SEM, understanding the key differences can help you decide which strategy is best for your business. Whether you choose SEO, SEM, or a combination of both, remember that both strategies require time, effort, and a solid understanding of your target audience.</p><h2>Cost</h2><p>When it comes to SEO vs SEM cost, each presents a different financial commitment. SEO is a long-term strategy that relies heavily on creating quality content, optimizing site structure, and building authoritative links. These efforts often require significant time and resources, but the investment can yield sustainable organic traffic growth over time.</p><p>On the other hand, SEM typically involves paying for ads to appear in search engine results. While this approach can deliver immediate visibility and traffic, costs can quickly add up, especially in competitive industries. Therefore, businesses must carefully consider their budget and marketing goals when deciding between SEO and SEM.</p><h3>SEO: An Investment in Time</h3><p>SEO requires a significant investment in time and resources. It involves creating high-quality content, optimizing your website, and building backlinks. However, once established, it can provide a steady flow of organic traffic that can keep your site visible for years.</p><h3>SEM: Immediate But Costly</h3><p>Unlike SEO, SEM offers immediate visibility in search engine results through paid ads. However, this immediate visibility comes at a price. SEM can be quite expensive, especially in competitive industries, and requires ongoing investment to maintain visibility.</p><h3>Making the Choice: SEO vs SEM</h3><p>Ultimately, the choice between SEO and SEM depends on your business's budget, goals, and timeline. If you have a limited budget but plenty of time, SEO may be the better option. However, if you need immediate visibility and have the budget to support it, SEM might be the right choice.</p><h2>Time to See Results</h2><p>When comparing <strong>SEO vs SEM time to see results</strong>, it's important to understand the distinct pace at which these strategies produce outcomes.</p><h3>SEO Timeline</h3><p>SEO is a long-term investment. It might take several months to start seeing significant results. The process involves enhancing your website's visibility in organic (non-paid) search engine results. It's a gradual process of building trust and authority.</p><h3>SEM Timeline</h3><p>On the other hand, SEM can produce almost immediate results. As a paid strategy, your advertisements start showing up in search results as soon as your campaign is live. However, the moment you stop paying, your visibility diminishes.</p><p>In conclusion, while SEO takes time, it offers sustainable results. SEM provides quick wins but requires continuous investment.</p><h2>Sustainability</h2><p>When comparing the sustainability of <strong>SEO</strong> and <strong>SEM</strong>, it's essential to consider the long-term effects. SEO, being an organic strategy, tends to have a more enduring impact. Even though it requires consistent effort and time, the results are often long-lasting. On the other hand, SEM results are immediate but can disappear as soon as you stop funding the campaigns.</p><h3>Long-term SEO</h3><p>SEO is a marathon, not a sprint. It necessitates the consistent production of high-quality content and continuous optimization. However, once your site ranks high in search engine results, it can maintain its position for a long time, driving continuous organic traffic.</p><h3>Long-term SEM</h3><p>In contrast, SEM is more like a sprint. It can bring quick results, making it excellent for short-term campaigns or product launches. However, once you stop paying for ads, your visibility plummets. This makes SEM less sustainable in the long run unless you have a significant advertising budget.</p><h2>When to Use SEO vs. SEM</h2><p>SEO is ideal for long-term growth. It builds organic traffic and enhances brand credibility. Businesses looking to establish authority and invest in sustainable growth should prioritize SEO.</p><p>SEM, on the other hand, is perfect for immediate results. It's beneficial for short-term campaigns, product launches, or time-sensitive promotions. SEM allows businesses to quickly appear in search results and attract potential customers.</p><h3>Balancing SEO and SEM</h3><p>Combining SEO and SEM can be strategic. Use SEO for consistent, long-term traffic, and SEM to capitalize on immediate opportunities. This balanced approach maximizes visibility and ensures both short-term gains and long-term sustainability.</p><h2>How SEO and SEM Work Together</h2><p>The <em>relationship between SEO and SEM</em> is an integrated one. While they target different components of search marketing, they are complementary strategies that, when used together, can drive significant results.</p><h3>The Combined Strategy</h3><p>SEO focuses on <em>organic search</em>, improving your website's visibility in search engine results without paying for ads. On the other hand, SEM targets <em>paid search</em>, where you pay to appear in the sponsored results.</p><p>When you combine SEO and SEM, you create a powerful <em>integrated SEO and SEM strategy</em>. This approach leverages the strengths of both strategies.</p><p>For instance, while you are waiting for SEO efforts to kick in, SEM can provide immediate visibility. And once your SEO starts to show results, you can optimize your SEM campaigns according to the organic keywords that are performing well.</p><p>In essence, having a unified strategy with SEO and SEM working together can help you cover all aspects of search marketing, ensuring that you don't miss out on any potential opportunities.</p>",
  "markdown": "![featured image](https://images.unsplash.com/photo-1562577309-2592ab84b1bc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w1NDYzMzB8MHwxfHNlYXJjaHwxfHxzZW98ZW58MHx8fHwxNzI0Mjk4MjgxfDA&ixlib=rb-4.0.3&q=85)\n\n## Contents\n\n* [What is SEO?](#what-is-seo)\n* [What is SEM?](#what-is-sem)\n* [Key Differences Between SEO and SEM](#key-differences-between-seo-and-sem)  \n   * [Cost](#cost)  \n   * [Time to See Results](#time-to-see-results)  \n   * [Sustainability](#sustainability)\n* [When to Use SEO vs. SEM](#when-to-use-seo-vs-sem)\n* [How SEO and SEM Work Together](#how-seo-and-sem-work-together)\n\n## What is SEO?\n\n**Search Engine Optimization (SEO)** refers to the practice of enhancing a website to improve its visibility on search engine results pages (SERPs). It involves optimizing content, structure, and technical aspects to rank higher for relevant keywords. SEO aims to attract organic traffic through unpaid search results. Key components include keyword research, on-page optimization, and [technical SEO](https://usehubrank.com/glossary/technical-seo). Regular [SEO audits](https://usehubrank.com/glossary/seo-audit) ensure the website adheres to best practices. Effective SEO requires understanding search algorithms and user intent to deliver valuable, relevant [content](https://google.com).\n\n## What is SEM?\n\nSearch Engine Marketing, often referred to as **SEM**, is a digital marketing strategy used to increase the visibility of a website in search engine results pages ([SERPs](https://usehubrank.com/glossary/serp)). While similar to SEO, SEM often involves paid tactics like pay-per-click (PPC) advertising or cost-per-click (CPC) advertising.\n\nThe goal of SEM is to promote websites by increasing their visibility in search engine results pages primarily through paid advertising. It aims to improve [SERP rankings](https://usehubrank.com/glossary/serp-ranking) and increase [search volume](https://usehubrank.com/glossary/search-volume) to attract more visitors.\n\nRemember, effective SEM strategies can provide a business with improved visibility, more web traffic, and a higher search ranking.\n\n## Key Differences Between SEO and SEM\n\nWhile both SEO and SEM strategies aim to increase visibility in search engines, there are significant differences between the two. Understanding these differences can help marketers make informed decisions about their digital marketing strategies.\n\n![people sitting at the table](https://images.unsplash.com/photo-1624555130581-1d9cca783bc0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w1NDYzMzB8MHwxfHNlYXJjaHw0fHxzZW98ZW58MHx8fHwxNzI3OTc4NDI0fDA&ixlib=rb-4.0.3&q=85)\n\n### Cost\n\nOne of the main differences between SEO and SEM is the cost. SEO is a long-term strategy that involves optimizing your website to rank higher in search engine results. This can be done organically, meaning it doesn't require a direct cost. On the other hand, SEM involves paying for ads to appear in search engine results, which can be more costly.\n\n### Visibility\n\nAnother key difference is visibility. SEM can provide immediate visibility on search engines, as ads can be set up and live within a day. SEO, however, requires time and consistent effort to build ranking and visibility.\n\n### Targeting\n\nBoth SEO and SEM allow for targeting, but in different ways. With SEO, you can target specific keywords in your content to rank for. With SEM, you can target specific demographics, locations, and even times of day for your ads to appear.\n\n### Results\n\nFinally, the results from SEO and SEM can be different. SEM can provide immediate results, but once you stop paying for ads, your visibility can decrease. SEO results take longer to achieve, but they can provide lasting visibility and ranking.\n\nIn conclusion, while there are similarities between SEO and SEM, understanding the key differences can help you decide which strategy is best for your business. Whether you choose SEO, SEM, or a combination of both, remember that both strategies require time, effort, and a solid understanding of your target audience.\n\n## Cost\n\nWhen it comes to SEO vs SEM cost, each presents a different financial commitment. SEO is a long-term strategy that relies heavily on creating quality content, optimizing site structure, and building authoritative links. These efforts often require significant time and resources, but the investment can yield sustainable organic traffic growth over time.\n\nOn the other hand, SEM typically involves paying for ads to appear in search engine results. While this approach can deliver immediate visibility and traffic, costs can quickly add up, especially in competitive industries. Therefore, businesses must carefully consider their budget and marketing goals when deciding between SEO and SEM.\n\n### SEO: An Investment in Time\n\nSEO requires a significant investment in time and resources. It involves creating high-quality content, optimizing your website, and building backlinks. However, once established, it can provide a steady flow of organic traffic that can keep your site visible for years.\n\n### SEM: Immediate But Costly\n\nUnlike SEO, SEM offers immediate visibility in search engine results through paid ads. However, this immediate visibility comes at a price. SEM can be quite expensive, especially in competitive industries, and requires ongoing investment to maintain visibility.\n\n### Making the Choice: SEO vs SEM\n\nUltimately, the choice between SEO and SEM depends on your business's budget, goals, and timeline. If you have a limited budget but plenty of time, SEO may be the better option. However, if you need immediate visibility and have the budget to support it, SEM might be the right choice.\n\n## Time to See Results\n\nWhen comparing **SEO vs SEM time to see results**, it's important to understand the distinct pace at which these strategies produce outcomes.\n\n### SEO Timeline\n\nSEO is a long-term investment. It might take several months to start seeing significant results. The process involves enhancing your website's visibility in organic (non-paid) search engine results. It's a gradual process of building trust and authority.\n\n### SEM Timeline\n\nOn the other hand, SEM can produce almost immediate results. As a paid strategy, your advertisements start showing up in search results as soon as your campaign is live. However, the moment you stop paying, your visibility diminishes.\n\nIn conclusion, while SEO takes time, it offers sustainable results. SEM provides quick wins but requires continuous investment.\n\n## Sustainability\n\nWhen comparing the sustainability of **SEO** and **SEM**, it's essential to consider the long-term effects. SEO, being an organic strategy, tends to have a more enduring impact. Even though it requires consistent effort and time, the results are often long-lasting. On the other hand, SEM results are immediate but can disappear as soon as you stop funding the campaigns.\n\n### Long-term SEO\n\nSEO is a marathon, not a sprint. It necessitates the consistent production of high-quality content and continuous optimization. However, once your site ranks high in search engine results, it can maintain its position for a long time, driving continuous organic traffic.\n\n### Long-term SEM\n\nIn contrast, SEM is more like a sprint. It can bring quick results, making it excellent for short-term campaigns or product launches. However, once you stop paying for ads, your visibility plummets. This makes SEM less sustainable in the long run unless you have a significant advertising budget.\n\n## When to Use SEO vs. SEM\n\nSEO is ideal for long-term growth. It builds organic traffic and enhances brand credibility. Businesses looking to establish authority and invest in sustainable growth should prioritize SEO.\n\nSEM, on the other hand, is perfect for immediate results. It's beneficial for short-term campaigns, product launches, or time-sensitive promotions. SEM allows businesses to quickly appear in search results and attract potential customers.\n\n### Balancing SEO and SEM\n\nCombining SEO and SEM can be strategic. Use SEO for consistent, long-term traffic, and SEM to capitalize on immediate opportunities. This balanced approach maximizes visibility and ensures both short-term gains and long-term sustainability.\n\n## How SEO and SEM Work Together\n\nThe _relationship between SEO and SEM_ is an integrated one. While they target different components of search marketing, they are complementary strategies that, when used together, can drive significant results.\n\n### The Combined Strategy\n\nSEO focuses on _organic search_, improving your website's visibility in search engine results without paying for ads. On the other hand, SEM targets _paid search_, where you pay to appear in the sponsored results.\n\nWhen you combine SEO and SEM, you create a powerful _integrated SEO and SEM strategy_. This approach leverages the strengths of both strategies.\n\nFor instance, while you are waiting for SEO efforts to kick in, SEM can provide immediate visibility. And once your SEO starts to show results, you can optimize your SEM campaigns according to the organic keywords that are performing well.\n\nIn essence, having a unified strategy with SEO and SEM working together can help you cover all aspects of search marketing, ensuring that you don't miss out on any potential opportunities.",
  "title": "SEM vs. SEO: Key Differences Every Marketer Should Know",
  "seed_keyword": "sem vs seo",
  "meta_description": "Understand the key differences between SEO and SEM to boost your business's digital marketing strategy. Explore cost, result time, sustainability, and when to use SEO vs. SEM.",
  "featured_image": "https://images.unsplash.com/photo-1562577309-2592ab84b1bc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w1NDYzMzB8MHwxfHNlYXJjaHwxfHxzZW98ZW58MHx8fHwxNzI0Mjk4MjgxfDA&ixlib=rb-4.0.3&q=85",
  "slug": "sem-vs-seo-key-differences-every-marketer-should-know"
}`)}
        </SyntaxHighlighter>
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