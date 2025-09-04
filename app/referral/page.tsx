'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReferralSystem from '../../components/ReferralSystem';

export default function ReferralPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return <ReferralSystem />;
}