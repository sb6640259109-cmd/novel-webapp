"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios-client';
import NovelLibMark from '@/app/components/NovelLibMark';

export default function Login() {
  const router = useRouter();
  const [activeScreen, setActiveScreen] = useState('authScreen');
  const [form, setForm] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await api.get('/auth/session');
        if (response.data.authenticated) {
          router.replace(['AUTHOR', 'ADMIN'].includes(response.data.user.role) ? '/admin' : '/profile');
          router.refresh();
        }
      } catch (err) {
        // no-op
      }
    };

    checkSession();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setServerError('');

    try {
      const response = await api.post('/auth/login', {
        email: form.email,
        password: form.password,
      });

      if (response.data.success) {
        router.replace(['AUTHOR', 'ADMIN'].includes(response.data.user.role) ? '/admin' : '/profile');
        router.refresh();
      } else {
        setServerError(response.data.message || 'เข้าสู่ระบบไม่สำเร็จ');
      }
    } catch (error) {
      setServerError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {activeScreen === 'authScreen' && (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#203A5F] via-[#355F91] to-[#7397C4] relative overflow-hidden font-sans px-4 py-8 md:p-6">

          {/* Back to home — floats above on desktop, inline on mobile top */}
          <Link
            href="/"
            className="absolute top-4 left-4 md:top-5 md:left-5 z-20 flex items-center gap-1.5 text-white/70 hover:text-white text-[.8rem] font-medium no-underline transition-colors group"
          >
            <span className="transition-transform group-hover:-translate-x-0.5">←</span> หน้าหลัก
          </Link>

          <div className="relative z-10 flex flex-col md:flex-row gap-0 rounded-[22px] md:rounded-[30px] overflow-hidden shadow-[0_30px_90px_rgba(10,28,26,.32)] ring-1 ring-white/20 w-full max-w-[900px] bg-[#FFFFFF] mt-8 md:mt-0">

            {/* Left Banner — hidden on mobile */}
            <div className="w-full md:w-[360px] shrink-0 bg-gradient-to-br from-[#294B73] via-[#355F91] to-[#668AB8] py-12 px-10 flex-col justify-between hidden md:flex relative overflow-hidden">
              <div>
                <div className="flex items-center gap-2.5 text-[1.3rem] font-bold text-white mb-12">
                  <NovelLibMark className="w-10 h-10" inverted />
                  NovelLib
                </div>
                <div className="font-serif text-[1.05rem] text-white/85 leading-relaxed italic mb-4">
                  &ldquo;การอ่านคือการเดินทางผ่านมิติและเวลา โดยไม่ต้องก้าวเท้าออกจากบ้าน&rdquo;
                </div>
                <div className="text-[.78rem] text-white/50">— โลกแห่งการอ่าน</div>
              </div>
              <div className="text-[.78rem] text-white/45 leading-relaxed">
                &copy; 2026 NovelLib Platform.<br />All rights reserved.
              </div>
            </div>

            {/* Right Form */}
            <div className="flex-1 bg-[#FFFFFF] py-8 px-6 md:py-12 md:px-12 flex flex-col justify-center">

              {/* Mobile logo */}
              <div className="flex items-center gap-2 md:hidden mb-6">
                <NovelLibMark className="w-9 h-9" />
                <span className="font-bold text-[1.1rem] text-[#3F6FAF]">NovelLib</span>
              </div>

              <div className="text-[.72rem] font-bold tracking-widest text-[#6F96C9] uppercase mb-1.5">ยินดีต้อนรับกลับมา</div>
              <h1 className="text-[1.35rem] md:text-[1.55rem] font-bold text-[#1B2A41] mb-1.5 leading-snug">เข้าสู่ระบบ</h1>
              <div className="text-[.83rem] md:text-[.85rem] text-[#64748B] mb-6 md:mb-7 leading-relaxed">
                เพื่อเข้าถึงชั้นหนังสือและนิยายที่คุณติดตามไว้
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3.5">
                  <label className="text-[.8rem] font-semibold text-[#1B2A41] block mb-1">อีเมล</label>
                  <div className="relative">
                    <span className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[.9rem] text-[#8795A8] pointer-events-none">✉️</span>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full py-[10px] md:py-[9px] pr-3 pl-[34px] border-[1.5px] border-[#DCE5F0] rounded-lg text-[.88rem] text-[#1B2A41] bg-[#F4F7FB] outline-none transition-colors focus:border-[#6F96C9] focus:bg-white"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="mb-3.5">
                  <label className="text-[.8rem] font-semibold text-[#1B2A41] block mb-1">รหัสผ่าน</label>
                  <div className="relative">
                    <span className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[.9rem] text-[#8795A8] pointer-events-none">🔒</span>
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      className="w-full py-[10px] md:py-[9px] pr-3 pl-[34px] border-[1.5px] border-[#DCE5F0] rounded-lg text-[.88rem] text-[#1B2A41] bg-[#F4F7FB] outline-none transition-colors focus:border-[#6F96C9] focus:bg-white"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center mb-5 text-[.8rem]">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" className="accent-[#3F6FAF]" />
                    <span className="text-[#1B2A41]">จดจำฉันไว้ในระบบ</span>
                  </label>
                  <a href="#forgot" className="text-[#3F6FAF] font-semibold cursor-pointer no-underline hover:underline">ลืมรหัสผ่าน?</a>
                </div>

                {serverError && (
                  <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[.8rem] text-red-600">
                    {serverError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 md:py-2.5 rounded-lg bg-[#3F6FAF] text-white border-none text-[.92rem] font-semibold cursor-pointer transition-all hover:bg-[#2E568C] hover:shadow-[0_4px_16px_rgba(43,94,171,.3)] active:scale-[.98] mb-3.5 disabled:opacity-70"
                >
                  {isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                </button>

                <div className="text-center text-[#8795A8] text-[.78rem] my-3.5 relative flex items-center justify-center">
                  <div className="absolute left-0 w-[40%] h-px bg-[#DCE5F0]" />
                  <span className="bg-white px-2 relative z-10">หรือเข้าสู่ระบบด้วย</span>
                  <div className="absolute right-0 w-[40%] h-px bg-[#DCE5F0]" />
                </div>

                <button
                  type="button"
                  className="w-full py-3 md:py-2.5 rounded-lg border-[1.5px] border-[#DCE5F0] bg-white text-[.88rem] font-semibold cursor-pointer text-[#64748B] transition-colors hover:border-[#3F6FAF] hover:text-[#3F6FAF] flex items-center justify-center gap-2 mb-4"
                >
                  <span className="font-bold text-lg">G</span> Google
                </button>

                <div className="text-center text-[.82rem] text-[#64748B]">
                  ยังไม่มีบัญชีใช่ไหม?{' '}
                  <a href="/register" className="text-[#3F6FAF] font-semibold cursor-pointer no-underline hover:underline">สมัครสมาชิก</a>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeScreen === 'appScreen' && (
        <div className="flex min-h-screen items-center justify-center bg-[#F4F7FB] font-sans flex-col gap-4 p-6 text-center">
          <div className="w-[64px] h-[64px] rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] grid place-items-center text-[1.8rem] mb-2 shadow-[0_4px_20px_rgba(16,185,129,.3)]">✓</div>
          <h2 className="text-xl md:text-2xl font-bold text-[#3F6FAF]">เข้าสู่ระบบสำเร็จ!</h2>
          <p className="text-[.88rem] text-[#64748B]">ยินดีต้อนรับกลับมาสู่ NovelLib</p>
          <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full max-w-[280px]">
            <Link
              href="/"
              className="flex-1 text-center px-6 py-2.5 bg-[#3F6FAF] text-white rounded-lg font-semibold hover:bg-[#2E568C] transition no-underline"
            >
              🏠 ไปหน้าหลัก
            </Link>
            <button
              onClick={async () => {
                await api.post('/auth/logout');
                router.push('/login');
              }}
              className="flex-1 px-6 py-2.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      )}
    </>
  );
}
