'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/axios-client';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState({ type: '', text: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/session');
        if (response.data.authenticated) {
          const profile = await api.get('/profile');
          setUser(profile.data.user);
          setFormData(profile.data.user);
          setAvatarPreview(profile.data.user.avatarUrl || '');
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

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setNotice({ type: '', text: '' });
    try {
      let avatarUrl = formData.avatarUrl || null;
      if (avatarFile) {
        const uploadData = new FormData();
        uploadData.append('file', avatarFile);
        avatarUrl = (await api.post('/uploads/profile-avatar', uploadData)).data.avatarUrl;
      }
      const response = await api.put('/profile', {
        username: formData.username,
        displayName: formData.displayName,
        bio: formData.bio,
        avatarUrl,
      });
      setUser(response.data.user);
      setFormData(response.data.user);
      setEditMode(false);
      setAvatarFile(null);
      setAvatarPreview(response.data.user.avatarUrl || '');
      setNotice({ type: 'success', text: response.data.message });
      router.refresh();
    } catch (error) {
      setNotice({ type: 'error', text: error.response?.data?.message || 'บันทึกข้อมูลไม่สำเร็จ' });
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setFormData(user);
    setAvatarFile(null);
    setAvatarPreview(user.avatarUrl || '');
    setEditMode(false);
    setNotice({ type: '', text: '' });
  };

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

  return (
    <div className="novellib-profile min-h-screen bg-gradient-to-br from-[#203A5F] via-[#355F91] to-[#7397C4] px-4 py-6 text-[#1B2A41] sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">ข้อมูลผู้ใช้</h1>
            <p className="text-sm text-white/70 mt-1">จัดการบัญชีของคุณและตรวจสอบสิทธิ์การเข้าถึง</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/" 
              className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-white/20 transition-colors"
            >
              ← กลับหน้าหลัก
            </Link>
            {['AUTHOR', 'ADMIN'].includes(user.role) && <a
              href="/admin"
              className="rounded-lg bg-[#3F6FAF] px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-[#2E568C] transition-colors"
            >
              ไปหน้าจัดการ →
            </a>}
          </div>
        </div>

        {user.role === 'READER' && (
          <section className="relative mb-6 overflow-hidden rounded-[28px] border border-white/15 bg-[#203A5F] p-6 text-white shadow-[0_24px_60px_rgba(10,28,50,.24)] sm:p-8">
            <div aria-hidden="true" className="absolute -right-10 -top-16 h-52 w-52 rounded-full border-[32px] border-white/[.04]" />
            <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-[#AFC8E8]">จากนักอ่านสู่นักเขียน</p>
                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">มีเรื่องที่อยากเล่าให้คนอื่นอ่านไหม?</h2>
                <p className="mt-3 max-w-xl leading-7 text-white/75">สมัครเป็นนักเขียนเพื่อเผยแพร่นิยาย สร้างตอน และดูแลผลงานของคุณบน NovelLib</p>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/85"><span>✓ สมัครฟรี</span><span>✓ จัดการตอนด้วยตัวเอง</span><span>✓ ส่งคำขอครั้งเดียว</span></div>
              </div>
              <Link href="/author-apply" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-[#203A5F] no-underline shadow-lg transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                เริ่มสมัครนักเขียน <span aria-hidden="true">→</span>
              </Link>
            </div>
          </section>
        )}

        {/* Profile Card */}
        <div className="mb-6 rounded-[28px] border border-white/20 bg-[#FFFFFF] p-5 shadow-[0_24px_64px_rgba(10,28,26,.16)] sm:p-7 lg:p-9">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#E8F0FA] text-3xl font-bold text-[#3F6FAF] shadow-md">
                {user.avatarUrl
                  ? <Image src={user.avatarUrl} alt={user.displayName || user.username} fill unoptimized className="object-cover" />
                  : (user.displayName || user.username).slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
              <p className="text-sm uppercase tracking-widest text-[#8795A8] font-semibold">บัญชีผู้ใช้</p>
              <h2 className="mt-2 break-words text-2xl font-bold text-[#1B2A41] sm:text-3xl">{user.displayName || user.username}</h2>
              <p className="mt-1 break-all text-sm text-slate-500">@{user.username}</p>
              {user.bio && <p className="mt-2 max-w-xl text-sm text-slate-600">{user.bio}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-3xl bg-[#D1FAE5] px-4 py-2 text-sm font-semibold text-[#065F46]">
                ✓ ยืนยันแล้ว
              </div>
            </div>
          </div>

          {notice.text && (
            <div className={`mb-6 rounded-xl border p-3 text-sm ${notice.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
              {notice.text}
            </div>
          )}

          {editMode && (
            <form onSubmit={handleSave} className="mb-8 rounded-2xl border border-[#DCE5F0] bg-[#F8FAFC] p-6">
              <h3 className="mb-4 text-lg font-bold">แก้ไขข้อมูลบัญชี</h3>
              <div className="mb-5 flex flex-wrap items-center gap-4">
                <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#E8F0FA] text-2xl font-bold text-[#3F6FAF] shadow">
                  {avatarPreview
                    ? <Image src={avatarPreview} alt="ตัวอย่างรูปโปรไฟล์" fill unoptimized className="object-cover" />
                    : (formData.displayName || formData.username || '?').slice(0, 1).toUpperCase()}
                </div>
                <label className="cursor-pointer rounded-xl border border-[#3F6FAF] bg-white px-4 py-2.5 text-sm font-semibold text-[#3F6FAF]">
                  เลือกรูปโปรไฟล์
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
                        setNotice({ type: 'error', text: 'รูปต้องเป็น JPG, PNG หรือ WebP และมีขนาดไม่เกิน 5 MB' });
                        event.target.value = '';
                        return;
                      }
                      setAvatarFile(file);
                      setAvatarPreview(URL.createObjectURL(file));
                      setNotice({ type: '', text: '' });
                    }}
                  />
                </label>
                <span className="text-xs text-slate-500">JPG, PNG หรือ WebP ไม่เกิน 5 MB</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-[#64748B]">
                  ชื่อผู้ใช้
                  <input
                    value={formData.username || ''}
                    onChange={(event) => setFormData((old) => ({ ...old, username: event.target.value }))}
                    minLength={3}
                    maxLength={50}
                    required
                    className="mt-2 w-full rounded-xl border border-[#DCE5F0] bg-white px-3 py-2.5 text-[#1B2A41] outline-none focus:border-[#3F6FAF]"
                  />
                </label>
                <label className="text-sm font-semibold text-[#64748B]">
                  ชื่อที่แสดง
                  <input
                    value={formData.displayName || ''}
                    onChange={(event) => setFormData((old) => ({ ...old, displayName: event.target.value }))}
                    maxLength={100}
                    placeholder="ชื่อที่ต้องการให้ผู้อื่นเห็น"
                    className="mt-2 w-full rounded-xl border border-[#DCE5F0] bg-white px-3 py-2.5 text-[#1B2A41] outline-none focus:border-[#3F6FAF]"
                  />
                </label>
                <label className="text-sm font-semibold text-[#64748B]">
                  อีเมล
                  <input
                    value={formData.email || ''}
                    readOnly
                    className="mt-2 w-full cursor-not-allowed rounded-xl border border-[#E5E7EB] bg-slate-100 px-3 py-2.5 text-slate-500"
                  />
                  <span className="mt-1 block text-xs font-normal">อีเมลที่ยืนยันกับ Supabase ไม่สามารถแก้จากหน้านี้ได้</span>
                </label>
                <label className="text-sm font-semibold text-[#64748B] sm:col-span-2">
                  ประวัติย่อ
                  <textarea
                    value={formData.bio || ''}
                    onChange={(event) => setFormData((old) => ({ ...old, bio: event.target.value }))}
                    maxLength={500}
                    rows={4}
                    placeholder="แนะนำตัวสั้น ๆ"
                    className="mt-2 w-full rounded-xl border border-[#DCE5F0] bg-white px-3 py-2.5 text-[#1B2A41] outline-none focus:border-[#3F6FAF]"
                  />
                  <span className="mt-1 block text-right text-xs font-normal">{(formData.bio || '').length}/500</span>
                </label>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button disabled={isSaving} className="rounded-lg bg-[#3F6FAF] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
                <button type="button" onClick={cancelEdit} className="rounded-lg border bg-white px-5 py-2.5 text-sm font-semibold">
                  ยกเลิก
                </button>
              </div>
            </form>
          )}

          <div className="grid gap-4 sm:grid-cols-2 mb-8">
            <div className="rounded-2xl border border-[#E5E7EB] p-6 bg-[#FAFAFB] hover:shadow-md transition-shadow">
              <p className="text-sm font-semibold text-[#64748B] uppercase">อีเมล</p>
              <p className="mt-3 text-lg font-medium text-[#1B2A41]">{user.email}</p>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] p-6 bg-[#FAFAFB] hover:shadow-md transition-shadow">
              <p className="text-sm font-semibold text-[#64748B] uppercase">รหัสผู้ใช้</p>
              <p className="mt-3 text-lg font-medium text-[#1B2A41]">{user.id}</p>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] p-6 bg-[#FAFAFB] hover:shadow-md transition-shadow">
              <p className="text-sm font-semibold text-[#64748B] uppercase">สิทธิ์</p>
              <p className="mt-3 text-lg font-medium text-[#1B2A41]">{user.role || 'ผู้ใช้ทั่วไป'}</p>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] p-6 bg-[#FAFAFB] hover:shadow-md transition-shadow">
              <p className="text-sm font-semibold text-[#64748B] uppercase">วันที่เข้าระบบ</p>
              <p className="mt-3 text-lg font-medium text-[#1B2A41]">วันนี้</p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-6 mb-8">
            <h3 className="text-lg font-bold text-[#1B2A41] mb-4">📋 รายละเอียดบัญชี</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-[#3F6FAF] font-bold mt-1">•</span>
                <div>
                  <p className="text-sm font-semibold text-[#64748B]">ชื่อผู้ใช้</p>
                  <p className="text-[#1B2A41]">{user.username}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#3F6FAF] font-bold mt-1">•</span>
                <div>
                  <p className="text-sm font-semibold text-[#64748B]">อีเมลที่ยืนยันแล้ว</p>
                  <p className="text-[#1B2A41]">{user.email}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#3F6FAF] font-bold mt-1">•</span>
                <div>
                  <p className="text-sm font-semibold text-[#64748B]">UID ของบัญชี</p>
                  <p className="text-[#1B2A41] font-mono text-sm break-all">{user.id}</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Security Section */}
          <div className="rounded-2xl border border-[#FEE2E2] bg-[#FEF2F2] p-6 mb-8">
            <h3 className="text-lg font-bold text-[#991B1B] mb-4">🔒 ความปลอดภัย</h3>
            <p className="text-[#64748B] mb-4">จัดการการตั้งค่าความปลอดภัยของบัญชีของคุณ</p>
            <button className="rounded-lg border border-[#EF4444] bg-white px-4 py-2 text-sm font-semibold text-[#EF4444] hover:bg-[#FEF2F2] transition-colors">
              เปลี่ยนรหัสผ่าน
            </button>
          </div>

          {/* Logout Button */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleLogout}
              className="flex-1 rounded-lg bg-[#EF4444] px-4 py-3 text-sm font-bold text-white hover:bg-[#DC2626] transition-colors"
            >
              ออกจากระบบ
            </button>
            <button
              onClick={() => editMode ? cancelEdit() : setEditMode(true)}
              className="flex-1 rounded-lg bg-[#3F6FAF] px-4 py-3 text-sm font-bold text-white hover:bg-[#2E568C] transition-colors"
            >
              {editMode ? 'ยกเลิก' : '✏️ แก้ไขข้อมูล'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
