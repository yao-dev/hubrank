import {
  Menu,
  Center,
  Container,
  Group,
  Button,
  Burger,
  rem,
  Modal,
  TextInput,
  Text,
  Flex,
  Alert,
  Title,
} from '@mantine/core';
import { useDisclosure, useInterval, useToggle } from '@mantine/hooks';
import { IconAlertCircle, IconChevronDown, IconLock, IconMail } from '@tabler/icons-react';
import { links } from './links';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';
import supabase from '@/helpers/supabase';
import { ResendParams, VerifyEmailOtpParams } from '@supabase/supabase-js';
import styles from './style.module.css';
// const HEADER_HEIGHT = rem(60);

// const useStyles = createStyles((theme) => ({
//   inner: {
//     height: HEADER_HEIGHT,
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },

//   links: {
//     [theme.fn.smallerThan('sm')]: {
//       display: 'none',
//     },
//   },

//   burger: {
//     [theme.fn.largerThan('sm')]: {
//       display: 'none',
//     },
//   },

//   link: {
//     display: 'block',
//     lineHeight: 1,
//     padding: `${rem(8)} ${rem(12)}`,
//     borderRadius: theme.radius.sm,
//     textDecoration: 'none',
//     color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
//     fontSize: theme.fontSizes.sm,
//     fontWeight: 500,

//     '&:hover': {
//       backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
//     },
//   },

//   linkLabel: {
//     marginRight: rem(5),
//   },
// }));

function WebsiteHeader() {
  // const { classes } = useStyles();
  const [opened, { toggle }] = useDisclosure(false);
  const [openedLogin, { open: openLogin, close: closeLogin }] = useDisclosure(false);
  const [type, toggleMode] = useToggle(['email', 'otp']);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [otpParams, setOtpParams] = useState<ResendParams | null>(null);
  const [count, setCount] = useState(60);
  const interval = useInterval(() => setCount((c) => c - 1), 1000);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (count === 0) {
      interval.stop();
      setCount(60)
    }
  }, [count])

  const form = useForm({
    initialValues: {
      email: '',
      otp: ''
    },
    validate: {
      email: (value: string) => (/^\S+@\S+$/.test(value) ? null : 'Please enter a valid email'),
      otp: (value: string) => type === 'email' || value?.length === 6 ? null : 'One-time login code is invalid or expired',
    }
  });


  const onCloseLogin = () => {
    closeLogin();
    form.reset();
    toggleMode('email');
    setCount(60)
  }

  const onSubmit = form.onSubmit(async (values) => {
    setError(false);
    if (type === 'email') {
      setIsAuthLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email: values.email,
        options: {
          shouldCreateUser: true
        }
      });

      setIsAuthLoading(false);

      if (error) {
        setError(true)
        return;
      }

      setIsAuthLoading(false);
      toggleMode();
      interval.start();
    } else {
      setIsAuthLoading(true);
      const { error } = await supabase.auth.verifyOtp({
        email: form.values.email,
        token: values.otp,
        type: 'email'
      } as VerifyEmailOtpParams)

      if (error) {
        setError(true)
        setIsAuthLoading(false);
      }
    }
  })

  const resendOtp = async () => {
    if (interval.active) {
      return;
    }

    setError(false)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: form.values.email
      });

      if (error) {
        console.error(error)
        setError(true)
        return;
      }

      interval.stop();
      setCount(60);
      interval.start();
    } catch (e) {
      console.error(e)
      setError(true)
    }
  }

  const items = links.map((link) => {
    const menuItems = link.links?.map((item) => (
      <Menu.Item key={item.link}>{item.label}</Menu.Item>
    ));

    if (menuItems) {
      return (
        <Menu key={link.label} trigger="hover" transitionProps={{ exitDuration: 0 }} withinPortal>
          <Menu.Target>
            <a
              href={link.link}
              className={styles.link}
              onClick={(event) => event.preventDefault()}
            >
              <Center>
                <span className={styles.linkLabel}>{link.label}</span>
                <IconChevronDown size={rem(12)} stroke={1.5} />
              </Center>
            </a>
          </Menu.Target>
          <Menu.Dropdown>{menuItems}</Menu.Dropdown>
        </Menu>
      );
    }

    return (
      <a
        key={link.label}
        href={link.link}
        className={styles.link}
        onClick={(event) => event.preventDefault()}
      >
        {link.label}
      </a>
    );
  });

  return (
    <div className={styles.header}>
      <Modal
        size="md"
        opened={openedLogin}
        onClose={onCloseLogin}
        trapFocus={false}
        withCloseButton={false}
      >
        <form onSubmit={onSubmit}>
          <Flex direction="column" gap="md">
            <Text size="xl" fw="bold">Login</Text>
            {error && (
              <Alert icon={<IconAlertCircle size="1rem" />} title="Bummer!" color="red" variant="filled">
                Something went wrong! Try again please.
              </Alert>
            )}
            <TextInput
              withAsterisk
              label="Email"
              placeholder="Email"
              leftSection={<IconMail />}
              size="md"
              autoComplete="email"
              {...form.getInputProps('email')}
            />

            {type === 'otp' && (
              <>
                <TextInput
                  withAsterisk
                  label="One-time login code"
                  placeholder="Enter your login code"
                  leftSection={<IconLock />}
                  size="md"
                  {...form.getInputProps('otp')}
                />
                <Group justify="center">
                  <Text size="sm" color='blue' onClick={resendOtp} style={{ cursor: 'pointer' }}>Resend login code {interval.active ? `(${count}s)` : ''}</Text>
                </Group>
              </>
            )}

            <Group justify="center" mt="md">
              <Button size="md" loading={isAuthLoading} fullWidth type="submit">Continue</Button>
            </Group>
          </Flex>
        </form>
      </Modal>

      <Container className={styles.inner} fluid>
        <Group>
          <Burger opened={opened} onClick={toggle} className={styles.burger} size="sm" />
          <Title order={2}>Hubrank</Title>
        </Group>
        <Group spacing={5} className={styles.links}>
          {items}
        </Group>

        <Button size="md" onClick={openLogin}>Sign in</Button>
      </Container>
    </div>
  );
}

export default WebsiteHeader