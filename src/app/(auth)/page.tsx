'use client';;
import { IconLock, IconMail } from '@tabler/icons-react';
import supabase from '@/helpers/supabase';
import { VerifyEmailOtpParams } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { useInterval, useToggle } from '@mantine/hooks';
import { Form, Alert, Input, Button, Card, Flex, Typography, Image, Spin, Row, Col } from 'antd';
import { useRouter } from 'next/navigation';
import useSession from '@/hooks/useSession';

export default function Login() {
  const [isLoading, setIsLoading] = useState(true);
  const [type, toggleMode] = useToggle(['email', 'otp']);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [count, setCount] = useState(60);
  const interval = useInterval(() => setCount((c) => c - 1), 1000);
  const [error, setError] = useState(false);
  const [form] = Form.useForm();
  const email = Form.useWatch('email', form);
  const router = useRouter();
  const { session } = useSession();

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 1500);
  }, []);

  useEffect(() => {
    if (session) {
      router.replace('/dashboard');
    }
  }, [session])

  useEffect(() => {
    if (count === 0) {
      interval.stop();
      setCount(60)
    }
  }, [count]);


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
    <Flex vertical align="center" justify="center" style={{ height: '100dvh', background: "#F9FAFB" }}>
      {isLoading ? (
        <Spin />
      ) : (
        <Row justify="center" style={{ width: "100%" }}>
          <Col xs={20} sm={13} md={9} xl={6} xxl={5}>
            <Card bordered style={{ borderRadius: 10, marginTop: 32 }}>
              <p style={{ margin: 0, textAlign: "center" }}>
                <Image
                  src="/brand-logo-black.png"
                  width={175}
                  preview={false}
                  style={{ marginBottom: 72 }}
                />
              </p>

              <Typography.Title level={3} style={{ fontWeight: 700, margin: 0, textAlign: "center" }}>
                Log in or sign up
              </Typography.Title>
              <Typography.Paragraph style={{ marginTop: 6, textAlign: "center", fontWeight: 400, marginBottom: 24 }}>
                Enter your email to get a login code
              </Typography.Paragraph>

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
                  <Alert type="error" message="Something went wrong! Try again please." showIcon style={{ marginBottom: 12 }} />
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

                        <Typography.Text onClick={resendOtp} style={{ cursor: 'pointer', textAlign: 'center' }}>Resend login code {interval.active ? `(${count}s)` : ''}</Typography.Text>
                      </>
                    ) : null

                  }}
                </Form.Item>

                <Form.Item style={{ margin: 0, marginTop: 24 }}>
                  <Button size="large" block type="primary" htmlType="submit" loading={isAuthLoading}>
                    {type === "otp" ? "Login" : "Get login in code"}
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      )}
    </Flex>
  );
}