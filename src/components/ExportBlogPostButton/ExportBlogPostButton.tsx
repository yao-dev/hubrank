'use client';;
import useBlogPosts from '@/hooks/useBlogPosts';
import { Button, Dropdown, MenuProps, message } from 'antd';
import useProjects from '@/hooks/useProjects';
import { isEmpty } from 'lodash';
import { IconDownload } from '@tabler/icons-react';
import prettify from "pretty";
import useProjectId from '@/hooks/useProjectId';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import { format } from 'date-fns';

const ExportBlogPostButton = ({ id, disabled }) => {
  const projectId = useProjectId()
  const { getOne } = useBlogPosts();
  const { data: article } = getOne(id)
  const { data: project } = useProjects().getOne(projectId);

  const url = project && article ? new URL(article?.slug ?? "", project?.blog_path ?? "") : "";

  const html = prettify(`
<html>
<head>
<title>${article?.title ?? ""}</title>
<meta name="description" content="${article?.meta_description}">
<meta name="keywords" content="${article?.keywords?.join()}" />
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" />

{/* <!-- Facebook / Pinterest --> */}
<meta property="og:url" content="${url?.href}">
<meta property="og:type" content="article">
<meta property="og:title" content="${article?.title}">
<meta property="og:description" content="${article?.meta_description}">
<meta property="og:image" content="${article?.featured_image}">
<meta property="og:site_name" content="${url?.host}" />

{/* <!-- Twitter --> */}
<meta name="twitter:card" content="summary_large_image">
<meta property="twitter:domain" content="${url?.host}">
<meta property="twitter:url" content="${url?.href}">
<meta name="twitter:title" content="${article?.title}">
<meta name="twitter:description" content="${article?.meta_description}">
<meta name="twitter:image" content="${article?.featured_image}">

${!isEmpty(article?.schema_markups ?? {}) && `
<script type="application/ld+json">
${JSON.stringify(article.schema_markups)}
</script>
`}
<head>
<body>
<h1>${article?.title ?? ""}</h1>
${article?.html}
</body>
</html>
`);

  const onCopyHTML = () => {
    navigator.clipboard.writeText(html);
    message.success("Copied to clipboard!");
  }

  const onCopyMarkdown = () => {
    navigator.clipboard.writeText(`
---
title: "${article.title ?? ""}"
description: "${article.meta_description ?? ""}"
image: ${article.og_image_url ?? ""}
keywords: "${article.keywords.join() ?? ""}"
date: ${format(article.created_at, "yyyy-MM-dd")}
modified: ${format(new Date(), "yyyy-MM-dd")}
---

${NodeHtmlMarkdown.translate(html)}
      `);
    message.success("Copied to clipboard!");
  }

  const items: MenuProps['items'] = [
    {
      label: "HTML",
      key: '0',
      onClick: onCopyHTML
    },
    {
      label: "Markdown",
      key: '1',
      onClick: onCopyMarkdown
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']} disabled={disabled}>
      <Button
        icon={<IconDownload size={18} />}
        className='w-fit flex flex-row items-center'
        disabled={!["ready_to_view", "published"].includes(article?.status)}
      >
        Export
      </Button>
    </Dropdown>
  )
}

export default ExportBlogPostButton