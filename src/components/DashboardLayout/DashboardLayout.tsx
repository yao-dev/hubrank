'use client';
import styles from './style.module.css';
import { MouseEvent, useEffect, useState } from 'react';
import { AppShell, Burger, Chip, Flex, Group, ScrollArea, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSettings, IconLogout, IconPlug, IconCreditCard, IconStack2 } from '@tabler/icons-react';
import supabase from '@/helpers/supabase';
import { Notifications } from '@mantine/notifications';
import Link from 'next/link';
import cx from 'clsx';
import { usePathname } from 'next/navigation';
import useProjects from '@/hooks/useProjects';
import ProjectSelect from '../ProjectSelect';

// const useStyles = createStyles((theme) => ({
//   header: {
//     paddingBottom: theme.spacing.md,
//     marginBottom: `calc(${theme.spacing.md} * 1.5)`,
//     borderBottom: `${rem(1)} solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
//       }`,
//   },

//   footer: {
//     paddingTop: theme.spacing.md,
//     marginTop: theme.spacing.md,
//     borderTop: `${rem(1)} solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
//       }`,
//   },

//   link: {
//     ...theme.fn.focusStyles(),
//     display: 'flex',
//     alignItems: 'center',
//     textDecoration: 'none',
//     fontSize: theme.fontSizes.sm,
//     color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[7],
//     padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
//     borderRadius: theme.radius.sm,
//     fontWeight: 500,

//     '&:hover': {
//       backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
//       color: theme.colorScheme === 'dark' ? theme.white : theme.black,

//       [`& .${getStylesRef('icon')}`]: {
//         color: theme.colorScheme === 'dark' ? theme.white : theme.black,
//       },
//     },
//   },

//   linkIcon: {
//     ref: getStylesRef('icon'),
//     color: theme.colorScheme === 'dark' ? theme.colors.dark[2] : theme.colors.gray[6],
//     marginRight: theme.spacing.sm,
//   },

//   linkActive: {
//     '&, &:hover': {
//       backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).background,
//       // backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[2] : theme.colors.gray[6],
//       color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
//       [`& .${getStylesRef('icon')}`]: {
//         color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
//       },
//     },
//   },
// }));

const data = [
  { id: "project", link: '/?tab=articles', label: 'Project', icon: IconStack2 },
  // { id: "project", link: '/', label: 'Home', icon: IconStack2 },
  // { id: "topic", link: '/topics', label: 'Topics', icon: IconSitemap },
  // { id: "article", link: '/articles', label: 'Articles', icon: IconVersions },
  // { id: "target-audience", link: '/target-audiences', label: 'Target audiences', icon: IconUsers },
  // { id: "competitor", link: '/competitors', label: 'Competitors', icon: IconApps },
  { id: "integration", link: '/integrations', label: 'Integrations', icon: IconPlug },
  { id: "billing", link: '/plan-billing', label: 'Plan & Billing', icon: IconCreditCard },
  { id: "setting", link: '/settings', label: 'Settings', icon: IconSettings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [active, setActive] = useState('Project');
  const [opened, { toggle }] = useDisclosure();
  const pathname = usePathname();
  const { data: projects } = useProjects().getAll();

  useEffect(() => {
    if (pathname === '/' || pathname === "") {
      setActive('Project');
    } else {
      const item = data.slice(1).find(i => pathname.startsWith(i.link));
      if (item) {
        setActive(item.label);
      }
    }
  }, [pathname])

  const onLogout = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    supabase.auth.signOut();
  }

  const links = data.map((item) => {
    return (
      <Link
        prefetch={false}
        className={cx(styles.link, active === item.label && styles.linkActive)}
        href={item.link}
        key={item.label}
        style={{
          textDecoration: 'none',
          color: 'black',
        }}
      >
        <Flex justify="space-between" align="center" gap="md">
          <Flex align="center">
            <item.icon className={styles.linkIcon} stroke={1.5} />
            <span>{item.label}</span>
          </Flex>
          {item.id === "integration" && <Chip color="blue" variant="outline" size="xs">coming soon</Chip>}
        </Flex>
      </Link>
    )
  });

  const hasProjects = projects?.length > 0

  return (
    <AppShell
      header={{ height: 50 }}
      // navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      navbar={{
        width: 300, breakpoint: 'sm', collapsed: { mobile: !opened }
      }}
      padding="md"
      transitionDuration={500}
      transitionTimingFunction="ease"
    // className={styles.appShell}
    >
      <AppShell.Header>
        <Group h="100%" px="md" w={250}>
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Title order={2}>Hubrank</Title>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        {hasProjects && (
          <AppShell.Section>
            <ProjectSelect />
          </AppShell.Section>
        )}
        <AppShell.Section grow mt={hasProjects ? "md" : undefined} mb="md" component={ScrollArea}>
          {links}
        </AppShell.Section>
        <AppShell.Section>
          <a href="#" className={styles.link} onClick={onLogout}>
            <IconLogout className={styles.linkIcon} stroke={1.5} />
            <span>Logout</span>
          </a>
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main>
        <Notifications limit={5} position="top-center" />
        {children}
      </AppShell.Main>
    </AppShell>
  )
}
