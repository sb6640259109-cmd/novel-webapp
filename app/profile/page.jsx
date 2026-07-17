'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios-client';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/session');
        if (response.data.authenticated) {
          setUser(response.data.user);
          setFormData(response.data.user);
        } else {
          router.push('/login');
        }
      } catch (err) {
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0f1b3d] via-[#1a3a7c] to-[#0d2654]">
        <div className="text-white text-lg">กำลังโหลด...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1b3d] via-[#1a3a7c] to-[#0d2654] p-6 text-[#111827]">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">ข้อมูลผู้ใช้</h1>
            <p className="text-sm text-white/70 mt-1">จัดการบัญชีของคุณและตรวจสอบสิทธิ์การเข้าถึง</p>
          </div>
          <div className="flex gap-3">
            <a 
              href="/" 
              className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-white/20 transition-colors"
            >
              ← กลับหน้าหลัก
            </a>
            <a 
              href="/admin" 
              className="rounded-lg bg-[#2B5EAB] px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-[#1e4080] transition-colors"
            >
              ไปหน้าจัดการ →
            </a>
          </div>
        </div>

        {/* Profile Card */}
        <div className="rounded-3xl bg-white p-8 shadow-xl border border-white/20 mb-6">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-widest text-[#9CA3AF] font-semibold">บัญชีผู้ใช้</p>
              <h2 className="mt-3 text-3xl font-bold text-[#111827]">{user.username}</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-3xl bg-[#D1FAE5] px-4 py-2 text-sm font-semibold text-[#065F46]">
                ✓ ยืนยันแล้ว
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 mb-8">
            <div className="rounded-2xl border border-[#E5E7EB] p-6 bg-[#FAFAFB] hover:shadow-md transition-shadow">
              <p className="text-sm font-semibold text-[#6B7280] uppercase">อีเมล</p>
              <p className="mt-3 text-lg font-medium text-[#111827]">{user.email}</p>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] p-6 bg-[#FAFAFB] hover:shadow-md transition-shadow">
              <p className="text-sm font-semibold text-[#6B7280] uppercase">รหัสผู้ใช้</p>
              <p className="mt-3 text-lg font-medium text-[#111827]">{user.id}</p>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] p-6 bg-[#FAFAFB] hover:shadow-md transition-shadow">
              <p className="text-sm font-semibold text-[#6B7280] uppercase">สิทธิ์</p>
              <p className="mt-3 text-lg font-medium text-[#111827]">{user.role || 'ผู้ใช้ทั่วไป'}</p>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] p-6 bg-[#FAFAFB] hover:shadow-md transition-shadow">
              <p className="text-sm font-semibold text-[#6B7280] uppercase">วันที่เข้าระบบ</p>
              <p className="mt-3 text-lg font-medium text-[#111827]">วันนี้</p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-6 mb-8">
            <h3 className="text-lg font-bold text-[#111827] mb-4">📋 รายละเอียดบัญชี</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-[#2B5EAB] font-bold mt-1">•</span>
                <div>
                  <p className="text-sm font-semibold text-[#6B7280]">ชื่อผู้ใช้</p>
                  <p className="text-[#111827]">{user.username}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#2B5EAB] font-bold mt-1">•</span>
                <div>
                  <p className="text-sm font-semibold text-[#6B7280]">อีเมลที่ยืนยันแล้ว</p>
                  <p className="text-[#111827]">{user.email}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#2B5EAB] font-bold mt-1">•</span>
                <div>
                  <p className="text-sm font-semibold text-[#6B7280]">UID ของบัญชี</p>
                  <p className="text-[#111827] font-mono text-sm break-all">{user.id}</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Security Section */}
          <div className="rounded-2xl border border-[#FEE2E2] bg-[#FEF2F2] p-6 mb-8">
            <h3 className="text-lg font-bold text-[#991B1B] mb-4">🔒 ความปลอดภัย</h3>
            <p className="text-[#6B7280] mb-4">จัดการการตั้งค่าความปลอดภัยของบัญชีของคุณ</p>
            <button className="rounded-lg border border-[#EF4444] bg-white px-4 py-2 text-sm font-semibold text-[#EF4444] hover:bg-[#FEF2F2] transition-colors">
              เปลี่ยนรหัสผ่าน
            </button>
          </div>

          {/* Logout Button */}
          <div className="flex gap-3">
            <button
              onClick={handleLogout}
              className="flex-1 rounded-lg bg-[#EF4444] px-4 py-3 text-sm font-bold text-white hover:bg-[#DC2626] transition-colors"
            >
              ออกจากระบบ
            </button>
            <button
              onClick={() => setEditMode(!editMode)}
              className="flex-1 rounded-lg bg-[#2B5EAB] px-4 py-3 text-sm font-bold text-white hover:bg-[#1e4080] transition-colors"
            >
              {editMode ? 'ยกเลิก' : '✏️ แก้ไขข้อมูล'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
