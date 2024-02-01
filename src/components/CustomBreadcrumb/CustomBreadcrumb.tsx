'use client';
import { Breadcrumb } from 'antd';
import Link from 'next/link';
import { IconStack2 } from '@tabler/icons-react';
import { usePathname } from 'next/navigation';
import useProjects from '@/hooks/useProjects';
import useProjectId from '@/hooks/useProjectId';
import useBlogPosts from '@/hooks/useBlogPosts';
import useArticleId from '@/hooks/useArticleId';

const CustomBreadcrumb = () => {
  const pathname = usePathname();
  const projectId = useProjectId();
  const { data: project } = useProjects().getOne(projectId);
  const articleId = useArticleId()
  const { data: article } = useBlogPosts().getOne(articleId)

  if (pathname === "/" || pathname === "/projects") return null;

  if (pathname.includes('/articles/new')) {
    return (
      <Breadcrumb style={{ margin: 16, marginBottom: 0 }}>
        <Breadcrumb.Item>
          <Link
            href="/projects"
            style={{ textDecoration: 'none' }}
          >
            <IconStack2 size={20} style={{ margin: 0 }} />
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link
            href={`/projects/${projectId}`}
            style={{ textDecoration: 'none' }}
          >
            {project?.name}
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>New article</Breadcrumb.Item>
      </Breadcrumb>
    )
  }

  if (pathname.includes('/articles/')) {
    return (
      <Breadcrumb style={{ margin: 16, marginBottom: 0 }}>
        <Breadcrumb.Item>
          <Link
            href="/projects"
            style={{ textDecoration: 'none' }}
          >
            <IconStack2 size={20} style={{ margin: 0 }} />
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link
            href={`/projects/${projectId}`}
            style={{ textDecoration: 'none' }}
          >
            {project?.name}
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{article?.title?.length > 40 ? `${article?.title?.slice?.(0, 40)}...` : article?.title}</Breadcrumb.Item>
      </Breadcrumb>
    )
  }

  if (pathname.includes('/projects') && pathname.includes('/settings')) {
    return (
      <Breadcrumb style={{ margin: 16, marginBottom: 0 }}>
        <Breadcrumb.Item>
          <Link
            href="/projects"
            style={{ textDecoration: 'none' }}
          >
            <IconStack2 size={20} style={{ margin: 0 }} />
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link
            href={`/projects/${projectId}`}
            style={{ textDecoration: 'none' }}
          >
            {project?.name}
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Settings</Breadcrumb.Item>
      </Breadcrumb>
    )
  }

  if (pathname.includes('/projects')) {
    return (
      <Breadcrumb style={{ margin: 16, marginBottom: 0 }}>
        <Breadcrumb.Item>
          <Link
            href="/projects"
            style={{ textDecoration: 'none' }}
          >
            <IconStack2 size={20} style={{ margin: 0 }} />
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          {project?.name}
        </Breadcrumb.Item>
      </Breadcrumb>
    )
  }

  if (pathname.includes('/integrations')) {
    return (
      <Breadcrumb style={{ margin: 16, marginBottom: 0 }}>
        <Breadcrumb.Item>
          <Link
            href="/projects"
            style={{ textDecoration: 'none' }}
          >
            <IconStack2 size={20} style={{ margin: 0 }} />
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Integrations</Breadcrumb.Item>
      </Breadcrumb>
    )
  }

  if (pathname.includes('/plan-billing')) {
    return (
      <Breadcrumb style={{ margin: 16, marginBottom: 0 }}>
        <Breadcrumb.Item>
          <Link
            href="/projects"
            style={{ textDecoration: 'none' }}
          >
            <IconStack2 size={20} style={{ margin: 0 }} />
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Plan & Billing</Breadcrumb.Item>
      </Breadcrumb>
    )
  }

  if (pathname.includes('/settings')) {
    return (
      <Breadcrumb style={{ margin: 16, marginBottom: 0 }}>
        <Breadcrumb.Item>
          <Link
            href="/projects"
            style={{ textDecoration: 'none' }}
          >
            <IconStack2 size={20} style={{ margin: 0 }} />
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Settings</Breadcrumb.Item>
      </Breadcrumb>
    )
  }

  return null
}

export default CustomBreadcrumb