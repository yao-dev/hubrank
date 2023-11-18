'use client'
import { Paper, Title, Text, TextInput, Button, Container, Group, Alert, Flex } from '@mantine/core';
import { IconAlertCircle, IconLock, IconMail } from '@tabler/icons-react';
import classes from './styles.module.css';
import supabase from '@/helpers/supabase';
import { ResendParams, VerifyEmailOtpParams } from '@supabase/supabase-js';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';
import { useInterval, useToggle } from '@mantine/hooks';

export default function AuthPage() {
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

  return (
    <Container size={460} my={30}>
      <Title className={classes.title} ta="center">
        Welcome back!
      </Title>
      <Text c="dimmed" fz="sm" ta="center">
        Enter your email to get a login code
      </Text>

      <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
        <form onSubmit={onSubmit}>
          <Flex direction="column" gap="md">
            {error && (
              <Alert icon={<IconAlertCircle size="1rem" />} title="Bummer!" color="red" variant="filled">
                Something went wrong! Try again please.
              </Alert>
            )}
            <TextInput
              withAsterisk
              label="Email"
              placeholder="me@gmail.com"
              leftSection={<IconMail />}
              size="md"
              autoComplete="email"
              required
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
                  <Text size="sm" onClick={resendOtp} style={{ cursor: 'pointer' }}>Resend login code {interval.active ? `(${count}s)` : ''}</Text>
                </Group>
              </>
            )}

            {/* <Group justify="space-between" mt="lg" className={classes.controls}>
          <Anchor c="dimmed" size="sm" className={classes.control}>
            <Center inline>
              <IconArrowLeft style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
              <Box ml={5}>Back to the login page</Box>
            </Center>
          </Anchor>
          <Button className={classes.control}>Reset password</Button>
        </Group> */}

            <Group justify="center" mt="md">
              <Button className={classes.control} size="md" loading={isAuthLoading} fullWidth type="submit">Continue</Button>
            </Group>
          </Flex>
        </form>
      </Paper>
    </Container>
  );
}