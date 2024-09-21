'use client';;
import { IconLock, IconMail } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useInterval, useToggle } from '@mantine/hooks';
import { Form, Alert, Input, Button, Card, Typography, Image, Divider, message } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import useSession from '@/hooks/useSession';
import Label from '@/components/Label/Label';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';
import GoogleSignInButton from '@/components/GoogleSignInButton/GoogleSignInButton';
import axios from 'axios';
import { useReCaptcha } from 'next-recaptcha-v3';
import supabase from '@/helpers/supabase/client';
import useUser from '@/hooks/useUser';

export default function Login() {
  // const [isLoading, setIsLoading] = useState(true);
  const [type, toggleMode] = useToggle(['email', 'otp']);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [count, setCount] = useState(60);
  const interval = useInterval(() => setCount((c) => c - 1), 1000);
  const [error, setError] = useState<boolean | string>(false);
  const [form] = Form.useForm();
  const email = Form.useWatch('email', form);
  const router = useRouter();
  const { session } = useSession();
  const { executeRecaptcha } = useReCaptcha();
  const searchParams = useSearchParams();
  const appSumoCode = searchParams.get("appsumo_code") ?? "";
  const user = useUser();

  useEffect(() => {
    if (appSumoCode) {
      localStorage.setItem("appsumo_code", appSumoCode)
    }
  }, [appSumoCode]);

  useEffect(() => {
    if (session) {
      router.replace('/');
    }
  }, [session])

  useEffect(() => {
    if (count === 0) {
      interval.stop();
      setCount(60)
    }
  }, [count]);

  const isEmailRestricted = (email: string) => {
    const restrictedPattern = /^[a-zA-Z0-9._%+-]+\+[a-zA-Z0-9._%+-]+@.+$/;
    return restrictedPattern.test(email);
  }

  const onSubmit = async (values: any) => {
    try {
      setError(false);
      if (type === 'email') {
        if (isEmailRestricted(values.email)) {
          message.error("Invalid email")
          return;
        }

        setIsAuthLoading(true);

        const token = await executeRecaptcha("form_login");
        const { data: recaptcha } = await axios.post("/api/recaptcha", { token });

        if (!recaptcha.success) {
          setIsAuthLoading(false);
          setError(true);
          return;
        }

        const { error } = await supabase.auth.signInWithOtp({
          email: values.email,
          options: {
            shouldCreateUser: true,
          },
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
          return;
        }

        // revalidatePath('/', 'layout')
        // redirect('/app')
      }
    } catch (e) {
      console.log(e)
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

  const renderBackButton = (cls: string = "") => {
    return (
      <Button
        type="text"
        onClick={() => {
          router.push(`${location.protocol}//${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
        }}
        icon={<ArrowLeftOutlined />}
        className={`absolute top-6 left-6 ${cls}`}
      >
        Back
      </Button>
    )
  }

  return (
    <div className='flex flex-row h-screen'>
      <div className='relative hidden md:flex bg-[#001727] md:w-1/2 text-center items-center justify-center'>
        {renderBackButton("text-white hidden md:inline")}
        <h1 className="lg:w-2/3 w-full text-4xl lg:text-6xl font-black mb-4 text-white">
          Grow 10x Faster with <span className='text-primary-500 rotate-45'>Hubrank</span>
        </h1>
      </div>

      <div className='relative w-full bg-[#001727] md:bg-white md:w-1/2 flex items-center justify-center'>
        {renderBackButton("text-white md:hidden")}
        <Card className='border bg-white lg:border-none w-3/4 lg:w-2/3 xl:w-1/2'>
          <div className='flex flex-col gap-4 justify-center'>
            {appSumoCode && (
              <>
                <p className='m-0 text-center'>
                  <Image
                    src="https://appsumo2next-cdn.appsumo.com/_next/static/media/as-appsumo-logo-dark.fbc325ee.svg"
                    width={150}
                    preview={false}
                  />
                </p>
                <p className='text-center text-xl'>X</p>
              </>
            )}
            <p className='m-0 text-center'>
              <Image
                src="/brand-logo-black.webp"
                width={150}
                preview={false}
                style={{ marginBottom: 24 }}
              />
            </p>
          </div>

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
              <Input size="large" placeholder="Enter your email" prefix={<IconMail stroke={1.25} />} autoComplete="on" />
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
                ) : (
                  null
                )
              }}
            </Form.Item>

            <Form.Item style={{ margin: 0, marginTop: 24 }}>
              <Button size="large" block type="primary" htmlType="submit" loading={isAuthLoading}>
                {type === "otp" ? "Login" : "Get login code"}
              </Button>
            </Form.Item>

            <Divider plain>or</Divider>

            <Form.Item style={{ margin: 0, marginTop: 24 }}>
              <GoogleSignInButton />
            </Form.Item>
          </Form>
        </Card>

        <p className='text-white md:text-black text-xs absolute bottom-6 mx-auto'>
          By continuing, you agree to our <Link href="/terms-and-conditions" className='underline text-white md:text-black'>Terms and conditions</Link>
        </p>
      </div>
    </div>
  );
}