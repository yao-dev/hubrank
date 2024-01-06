'use client';;
import { Text } from '@mantine/core';
import { IconLock, IconMail } from '@tabler/icons-react';
import supabase from '@/helpers/supabase';
import { VerifyEmailOtpParams } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { useInterval, useToggle } from '@mantine/hooks';
import { Form, Alert, Input, Button, Card, Flex, Typography } from 'antd';

export default function AuthPage() {
  const [type, toggleMode] = useToggle(['email', 'otp']);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [count, setCount] = useState(60);
  const interval = useInterval(() => setCount((c) => c - 1), 1000);
  const [error, setError] = useState(false);
  const [form] = Form.useForm();
  const email = Form.useWatch('email', form);

  useEffect(() => {
    if (count === 0) {
      interval.stop();
      setCount(60)
    }
  }, [count])


  const onSubmit = async (values: any) => {
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
        email: values.email,
        token: values.otp,
        type: 'email'
      } as VerifyEmailOtpParams)

      if (error) {
        setError(true)
        setIsAuthLoading(false);
      }
    }
  }

  const resendOtp = async () => {
    if (interval.active) {
      return;
    }

    setError(false)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: form.getFieldValue("email")
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
    <Flex vertical align="center" justify="center" style={{ height: '100dvh' }}>
      <Typography.Title level={2} style={{ fontWeight: 700, margin: 0 }}>
        Welcome back!
      </Typography.Title>
      <Typography.Text style={{ marginTop: 6 }}>
        Enter your email to get a login code
      </Typography.Text>

      <Card style={{ width: '25%', borderRadius: 10, marginTop: 32 }}>
        <Form
          form={form}
          onFinish={onSubmit}
          layout="vertical"
          initialValues={{
            email: "",
            otp: ""
          }}
          autoComplete='off'
        >
          {error && (
            <Alert type="error" message="Something went wrong! Try again please." showIcon />
          )}

          <Form.Item name="email" label="Email" validateTrigger="onBlur" rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}>
            <Input size="large" placeholder="me@gmail.com" prefix={<IconMail stroke={1.5} />} />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => {
              return prevValues.email !== currentValues.email
            }}

          >
            {() => {
              return type === "otp" ? (
                <>
                  <Form.Item
                    name="otp"
                    label="One-time login code"
                    validateTrigger="onBlur"
                    rules={[{ required: true, message: 'One-time login code is invalid or expired', len: 6 }]}
                  >
                    <Input autoFocus size="large" placeholder="Enter your login code" prefix={<IconLock stroke={1.5} />} />
                  </Form.Item>

                  <Text onClick={resendOtp} style={{ cursor: 'pointer', textAlign: 'center' }}>Resend login code {interval.active ? `(${count}s)` : ''}</Text>

                </>
              ) : null

            }}
          </Form.Item>

          <Form.Item style={{ margin: 0, marginTop: 24 }}>
            <Button size="large" block type="primary" htmlType="submit" loading={isAuthLoading}>
              Continue
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Flex>
  );
}