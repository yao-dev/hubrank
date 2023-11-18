'use client';
import styles from './style.module.css';
import { MouseEvent, useEffect, useState } from 'react';
import { AppShell, Divider, ScrollArea, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconSettings,
  IconLogout,
  IconStack2,
  IconUsers,
  IconApps,
  IconPlug,
  IconCreditCard,
  IconSitemap,
  IconVersions,
} from '@tabler/icons-react';
import supabase from '@/helpers/supabase';
import { Notifications } from '@mantine/notifications';
import Link from 'next/link';
import cx from 'clsx';
import { usePathname } from 'next/navigation';

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
  { id: "project", link: '/', label: 'Projects', icon: IconStack2 },
  { id: "topic", link: '/topics', label: 'Topics', icon: IconSitemap },
  { id: "article", link: '/articles', label: 'Articles', icon: IconVersions },
  { id: "target-audience", link: '/target-audiences', label: 'Target audiences', icon: IconUsers },
  { id: "competitor", link: '/competitors', label: 'Competitors', icon: IconApps },
  { id: "integration", link: '/integrations', label: 'Integrations', icon: IconPlug },
  { id: "billing", link: '/plan-billing', label: 'Plan & Billing', icon: IconCreditCard },
  { id: "setting", link: '/settings', label: 'Settings', icon: IconSettings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [active, setActive] = useState('Projects');
  const [opened] = useDisclosure();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/' || pathname === "") {
      setActive('Projects');
    } else {
      const item = data.find(i => pathname.startsWith(i.link));
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
        <item.icon className={styles.linkIcon} stroke={1.5} />
        <span>{item.label}</span>
      </Link>
    )
  });

  return (
    <AppShell
      padding="md"
      transitionDuration={500}
      transitionTimingFunction="ease"
      // header={{
      //   height: { base: 50, md: 60 }
      // }}
      navbar={{
        width: {
          sm: 250
        },
        breakpoint: 'sm',
        collapsed: { mobile: !opened }
      }}
      className={styles.appShell}
    >
      {/* <AppShell.Header p="md">
        <Flex direction="row" align="center" justify="space-between" h="100%">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />

          <Flex direction="row" align="center" justify="space-between" w="100%">
            <Title order={2}>Hubrank</Title>
            <Tooltip
              label={`${colorScheme === 'dark' ? 'Light' : 'Dark'} theme`}
            >
              <ActionIcon
                variant="outline"
                color="dark"
                // color={theme.colorScheme === 'dark' ? 'yellow' : 'blue'}
                // onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
                onClick={() => toggleColorScheme()}
                size="lg"
              >
                {colorScheme === 'dark' ? <IconSun size="1.1rem" /> : <IconMoonStars size="1.1rem" />}
              </ActionIcon>
            </Tooltip>
          </Flex>
        </Flex>
      </AppShell.Header> */}

      <AppShell.Navbar p="md" hidden={!opened}>
        <Title order={2}>Hubrank</Title>

        <Divider size="xs" my="sm" />

        <AppShell.Section grow component={ScrollArea}>
          {links}
        </AppShell.Section>

        <AppShell.Section className={styles.footer}>
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
