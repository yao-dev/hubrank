'use client';

import WebsiteHeader from '@/components/WebsiteHeader/WebsiteHeader';
import useSession from '@/hooks/useSession';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter()
  const sessionStore = useSession()

  useEffect(() => {
    if (sessionStore.session) {
      router.push('/projects')
    } else {
      router.push('/')
    }
  }, [sessionStore.session])

  return (
    <WebsiteHeader />
  );
}