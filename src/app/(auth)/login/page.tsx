'use client';;
import { IconLock, IconMail } from '@tabler/icons-react';
import supabase from '@/helpers/supabase';
import { useEffect, useState } from 'react';
import { useInterval, useToggle } from '@mantine/hooks';
import { Form, Alert, Input, Button, Card, Typography, Image, Spin } from 'antd';
import { useRouter } from 'next/navigation';
import useSession from '@/hooks/useSession';
import Label from '@/components/Label/Label';

export default function Login() {
  const [isLoading, setIsLoading] = useState(true);
  const [type, toggleMode] = useToggle(['email', 'otp']);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [count, setCount] = useState(60);
  const interval = useInterval(() => setCount((c) => c - 1), 1000);
  const [error, setError] = useState<boolean | string>(false);
  const [form] = Form.useForm();
  const email = Form.useWatch('email', form);
  const router = useRouter();
  const { session } = useSession();

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 250);
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
        if (error.status === 429) {
          return setError("You've attempted login too many times, please try again later.")
        }
        return setError(true)
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
      })

      if (error) {
        console.log("error", error)
        if (error.status === 429) {
          setError("You've attempted login too many times, please try again later.")
        } {
          setError(true)
        }
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
    <div className='flex flex-row h-screen'>
      <div className='hidden md:flex bg-[#001727] md:w-1/2 text-center items-center justify-center'>
        <h1 className="lg:w-2/3 w-full text-4xl lg:text-6xl font-black mb-4 text-white">
          Grow 10x Faster with <span className='text-primary-500 rotate-45'>Hubrank</span>
        </h1>
      </div>

      <div className='w-full md:w-1/2 flex items-center justify-center'>
        {isLoading ? (
          <Spin />
        ) : (
          <Card className='border lg:border-none w-3/4 lg:w-2/3 xl:w-1/2'>
            <p style={{ margin: 0, textAlign: "center" }}>
              <Image
                src="/brand-logo-short.png"
                width={35}
                preview={false}
                style={{ marginBottom: 24 }}
              />
            </p>

            <Typography.Title level={4} style={{ fontWeight: 700, margin: 0, textAlign: "center" }}>
              Log in or sign up
            </Typography.Title>
            <Typography.Paragraph style={{ marginTop: 6, textAlign: "center", fontWeight: 400, marginBottom: 32, color: "#4B5563" }}>
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
                <Alert
                  type="error"
                  message={typeof error === "string" ? error : "Something went wrong! Try again please."}
                  showIcon
                  style={{ marginBottom: 12 }}
                />
              )}

              <Form.Item label={<Label name="Email" />} name="email" validateTrigger="onSubmit" rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}>
                <Input size="large" placeholder="name@example.com" prefix={<IconMail stroke={1.25} />} autoComplete="on" />
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
                        label={<Label name="One-time login code" />}
                        validateTrigger="onSubmit"
                        rules={[{ required: true, message: 'One-time login code is invalid or expired', len: 6 }]}
                      >
                        <Input autoFocus size="large" placeholder="Enter your login code" prefix={<IconLock stroke={1.25} />} />
                      </Form.Item>

                      <Typography.Text onClick={resendOtp} style={{ cursor: !count ? 'pointer' : "default", textAlign: 'center', display: "inline-block", width: "100%" }}>Resend login code {interval.active ? `(${count}s)` : ''}</Typography.Text>
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
        )}
      </div>
    </div>
  );
}