'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios-client';
import AdminPanel from './AdminPanel';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/session');
        if (response.data.authenticated && ['AUTHOR', 'ADMIN'].includes(response.data.user.role)) {
          setUser(response.data.user);
        } else if (response.data.authenticated) {
          router.replace('/profile');
        } else {
          router.replace('/login');
        }
      } catch (err) {
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#203A5F] via-[#355F91] to-[#7397C4]">
        <div className="text-white text-lg">กำลังโหลด...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <AdminPanel role={user.role} userId={user.id} />;
}
