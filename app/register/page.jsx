"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios-client';
import NovelLibMark from '@/app/components/NovelLibMark';

function PasswordStrength({ password }) {
  const getStrength = (pwd) => {
    if (!pwd) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { level: 1, label: 'อ่อนแอ', color: '#EF4444' };
    if (score === 2) return { level: 2, label: 'ปานกลาง', color: '#F59E0B' };
    if (score === 3) return { level: 3, label: 'ดี', color: '#10B981' };
    return { level: 4, label: 'แข็งแกร่งมาก', color: '#3F6FAF' };
  };

  const { level, label, color } = getStrength(password);
  if (!password) return null;

  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-[3px] flex-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: i <= level ? color : '#DCE5F0' }}
          />
        ))}
      </div>
      <div className="text-[.72rem] font-semibold" style={{ color }}>{label}</div>
    </div>
  );
}

export default function Register() {
  const router = useRouter();
  const [activeScreen, setActiveScreen] = useState('registerScreen');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agree: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = 'กรุณากรอกชื่อผู้ใช้';
    else if (form.username.length < 3) newErrors.username = 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร';
    if (!form.email.trim()) newErrors.email = 'กรุณากรอกอีเมล';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    if (!form.password) newErrors.password = 'กรุณากรอกรหัสผ่าน';
    else if (form.password.length < 8) newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
    if (!form.confirmPassword) newErrors.confirmPassword = 'กรุณายืนยันรหัสผ่าน';
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    if (!form.agree) newErrors.agree = 'กรุณายอมรับข้อกำหนดการใช้งาน';
    return newErrors;
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await api.get('/auth/session');
        if (response.data.authenticated) {
          router.push(response.data.user.role === 'ADMIN' ? '/admin' : response.data.user.role === 'AUTHOR' ? '/' : '/profile');
        }
      } catch (err) {
        // no-op
      }
    };

    checkSession();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setServerError('');
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      const response = await api.post('/auth/register', {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        termsAccepted: form.agree,
      });

      if (response.data.success) {
        if (response.data.requiresEmailConfirmation) {
          setServerError(response.data.message || 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ');
          setActiveScreen('successScreen');
        } else {
          setServerError('');
          router.replace('/profile');
          router.refresh();
        }
      } else {
        setServerError(response.data.message || 'สมัครสมาชิกไม่สำเร็จ');
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase =
    'w-full py-[10px] md:py-[9px] pr-3 pl-[34px] border-[1.5px] rounded-lg text-[.88rem] text-[#1B2A41] bg-[#F4F7FB] outline-none transition-colors focus:border-[#6F96C9] focus:bg-white';

  return (
    <>
      {activeScreen === 'registerScreen' && (
        <div className="novellib-auth flex min-h-screen items-center justify-center bg-gradient-to-br from-[#203A5F] via-[#355F91] to-[#7397C4] relative overflow-hidden font-sans px-4 py-8 md:p-6">

          {/* Back to home */}
          <Link
            href="/"
            className="absolute top-4 left-4 md:top-5 md:left-5 z-20 flex items-center gap-1.5 text-white/70 hover:text-white text-[.8rem] font-medium no-underline transition-colors group"
          >
            <span className="transition-transform group-hover:-translate-x-0.5">←</span> หน้าหลัก
          </Link>

          {/* Decorative blobs */}
          <div className="absolute top-[-80px] left-[-80px] w-[340px] h-[340px] rounded-full bg-white/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-60px] right-[-60px] w-[280px] h-[280px] rounded-full bg-white/5 blur-3xl pointer-events-none" />

          <div className="auth-card relative z-10 mt-8 flex w-full max-w-[1040px] flex-col overflow-hidden rounded-[22px] bg-[#FFFFFF] shadow-[0_30px_90px_rgba(10,28,26,.24)] ring-1 ring-white/20 md:rounded-[30px] lg:mt-0 lg:flex-row">

            {/* Left Banner — hidden on mobile */}
            <div className="relative hidden w-full shrink-0 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#294B73] via-[#355F91] to-[#668AB8] px-10 py-12 lg:flex lg:w-[360px]">
              <div>
                <div className="flex items-center gap-2.5 text-[1.3rem] font-bold text-white mb-10">
                  <NovelLibMark className="w-10 h-10" inverted />
                  NovelLib
                </div>
                <div className="mb-8">
                  <div className="text-white text-[1.05rem] font-bold mb-3 leading-snug">
                    เริ่มต้นการเดินทาง<br />สู่โลกแห่งการอ่าน
                  </div>
                  <div className="text-white/70 text-[.82rem] leading-relaxed">
                    สมัครสมาชิกเพื่อเข้าถึงนิยายหลายพันเรื่อง ติดตามความคืบหน้าการอ่าน และค้นพบโลกใหม่ทุกวัน
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: '📖', text: 'นิยายกว่า 10,000 เรื่อง' },
                    { icon: '🔖', text: 'บันทึกความคืบหน้าอัตโนมัติ' },
                    { icon: '🌙', text: 'โหมดอ่านกลางคืน' },
                    { icon: '🏆', text: 'ระบบสะสมแต้มนักอ่าน' },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-2.5 text-white/85 text-[.82rem]">
                      <div className="w-[28px] h-[28px] bg-white/15 rounded-lg grid place-items-center text-[.85rem] shrink-0">{icon}</div>
                      {text}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-[.72rem] text-white/40 leading-relaxed mt-6">
                &copy; 2026 NovelLib Platform.<br />All rights reserved.
              </div>
            </div>

            {/* Right Form */}
            <div className="flex-1 bg-[#FFFFFF] py-7 px-6 md:py-10 md:px-12 flex flex-col justify-center overflow-y-auto">

              {/* Mobile logo + feature strip */}
              <div className="mb-5 lg:hidden">
                <div className="flex items-center gap-2 mb-4">
                  <NovelLibMark className="w-9 h-9" />
                  <span className="font-bold text-[1.1rem] text-[#3F6FAF]">NovelLib</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['📖 10,000+ เรื่อง', '🔖 บันทึกความคืบหน้า', '🌙 โหมดกลางคืน'].map((t) => (
                    <span key={t} className="text-[.68rem] px-2.5 py-1 rounded-full bg-[#E8F0FA] text-[#3F6FAF] font-medium">{t}</span>
                  ))}
                </div>
              </div>

              <div className="text-[.72rem] font-bold tracking-widest text-[#6F96C9] uppercase mb-1">เริ่มต้นใหม่วันนี้</div>
              <h1 className="text-[1.3rem] md:text-[1.45rem] font-bold text-[#1B2A41] mb-1 leading-snug">สมัครสมาชิก</h1>
              <div className="text-[.82rem] md:text-[.83rem] text-[#64748B] mb-5 md:mb-6 leading-relaxed">
                มีบัญชีอยู่แล้ว?{' '}
                <a href="/login" className="text-[#3F6FAF] font-semibold cursor-pointer no-underline hover:underline">
                  เข้าสู่ระบบ
                </a>
              </div>

              {serverError ? (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {serverError}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} noValidate>
                {/* Username */}
                <div className="mb-3">
                  <label className="text-[.8rem] font-semibold text-[#1B2A41] block mb-1">
                    ชื่อผู้ใช้ <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[.9rem] text-[#8795A8] pointer-events-none">👤</span>
                    <input
                      id="register-username"
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      placeholder="ชื่อที่แสดงในระบบ"
                      className={`${inputBase} ${errors.username ? 'border-[#EF4444] bg-red-50' : 'border-[#DCE5F0]'}`}
                    />
                  </div>
                  {errors.username && <p className="text-[.72rem] text-[#EF4444] mt-1">{errors.username}</p>}
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label className="text-[.8rem] font-semibold text-[#1B2A41] block mb-1">
                    อีเมล <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[.9rem] text-[#8795A8] pointer-events-none">✉️</span>
                    <input
                      id="register-email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={`${inputBase} ${errors.email ? 'border-[#EF4444] bg-red-50' : 'border-[#DCE5F0]'}`}
                    />
                  </div>
                  {errors.email && <p className="text-[.72rem] text-[#EF4444] mt-1">{errors.email}</p>}
                </div>

                {/* Password + Confirm side-by-side on md+ */}
                <div className="mb-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {/* Password */}
                  <div>
                    <label className="text-[.8rem] font-semibold text-[#1B2A41] block mb-1">
                      รหัสผ่าน <span className="text-[#EF4444]">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[.9rem] text-[#8795A8] pointer-events-none">🔒</span>
                      <input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="อย่างน้อย 8 ตัวอักษร"
                        className={`${inputBase} pr-10 ${errors.password ? 'border-[#EF4444] bg-red-50' : 'border-[#DCE5F0]'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[.8rem] text-[#8795A8] hover:text-[#64748B] border-none bg-transparent cursor-pointer p-0 leading-none"
                        aria-label="toggle password visibility"
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {errors.password && <p className="text-[.72rem] text-[#EF4444] mt-1">{errors.password}</p>}
                    <PasswordStrength password={form.password} />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="text-[.8rem] font-semibold text-[#1B2A41] block mb-1">
                      ยืนยันรหัสผ่าน <span className="text-[#EF4444]">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[.9rem] text-[#8795A8] pointer-events-none">🔑</span>
                      <input
                        id="register-confirm-password"
                        type={showConfirm ? 'text' : 'password'}
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className={`${inputBase} pr-10 ${
                          errors.confirmPassword
                            ? 'border-[#EF4444] bg-red-50'
                            : form.confirmPassword && form.password === form.confirmPassword
                            ? 'border-[#10B981] bg-green-50'
                            : 'border-[#DCE5F0]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[.8rem] text-[#8795A8] hover:text-[#64748B] border-none bg-transparent cursor-pointer p-0 leading-none"
                        aria-label="toggle confirm password visibility"
                      >
                        {showConfirm ? '🙈' : '👁️'}
                      </button>
                      {form.confirmPassword && form.password === form.confirmPassword && (
                        <span className="absolute right-[32px] top-1/2 -translate-y-1/2 text-[#10B981] text-[.9rem] font-bold">✓</span>
                      )}
                    </div>
                    {errors.confirmPassword && <p className="text-[.72rem] text-[#EF4444] mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>

                {/* Terms */}
                <div className="mb-4">
                  <label className={`flex items-start gap-2 cursor-pointer text-[.82rem] ${errors.agree ? 'text-[#EF4444]' : 'text-[#64748B]'}`}>
                    <input
                      id="register-agree"
                      type="checkbox"
                      name="agree"
                      checked={form.agree}
                      onChange={handleChange}
                      className="mt-[3px] accent-[#3F6FAF] shrink-0"
                    />
                    <span>
                      ฉันมีอายุอย่างน้อย 13 ปี และยอมรับ{' '}
                      <Link href="/terms" target="_blank" className="text-[#3F6FAF] font-semibold no-underline hover:underline">กฎการใช้งานทั้งหมด</Link>
                      {' '}และ{' '}
                      <Link href="/privacy" target="_blank" className="text-[#3F6FAF] font-semibold no-underline hover:underline">นโยบายความเป็นส่วนตัว</Link>
                    </span>
                  </label>
                  {errors.agree && <p className="text-[.72rem] text-[#EF4444] mt-1 ml-5">{errors.agree}</p>}
                </div>

                {serverError && (
                  <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[.8rem] text-red-600">
                    {serverError}
                  </div>
                )}

                {/* Submit */}
                <button
                  id="register-submit"
                  type="submit"
                  disabled={isSubmitting || !form.agree}
                  className="w-full py-3 md:py-2.5 rounded-lg bg-[#3F6FAF] text-white border-none text-[.92rem] font-semibold cursor-pointer transition-all duration-200 hover:bg-[#2E568C] hover:shadow-[0_4px_16px_rgba(43,94,171,.35)] active:scale-[.98] mb-3.5 disabled:opacity-70"
                >
                  {isSubmitting ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิกฟรี'}
                </button>

                {/* Divider */}
                <div className="text-center text-[#8795A8] text-[.78rem] my-3 relative flex items-center justify-center">
                  <div className="absolute left-0 w-[40%] h-px bg-[#DCE5F0]" />
                  <span className="bg-white px-2 relative z-10">หรือสมัครด้วย</span>
                  <div className="absolute right-0 w-[40%] h-px bg-[#DCE5F0]" />
                </div>

                {/* Google */}
                <button
                  id="register-google"
                  type="button"
                  className="w-full py-3 md:py-2.5 rounded-lg border-[1.5px] border-[#DCE5F0] bg-white text-[.88rem] font-semibold cursor-pointer text-[#64748B] transition-all duration-200 hover:border-[#3F6FAF] hover:text-[#3F6FAF] hover:bg-[#E8F0FA] flex items-center justify-center gap-2"
                >
                  <span className="font-bold text-lg leading-none">G</span> Google
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Success Screen */}
      {activeScreen === 'successScreen' && (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#203A5F] via-[#355F91] to-[#7397C4] font-sans p-6">
          <div className="bg-white rounded-[20px] shadow-[0_8px_48px_rgba(43,94,171,.22)] p-8 md:p-10 flex flex-col items-center text-center max-w-[420px] w-full">
            <div className="w-[64px] md:w-[72px] h-[64px] md:h-[72px] rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] grid place-items-center text-[1.8rem] md:text-[2rem] mb-5 shadow-[0_4px_20px_rgba(16,185,129,.35)]">
              ✓
            </div>
            <h2 className="text-[1.2rem] md:text-[1.4rem] font-bold text-[#1B2A41] mb-2">สมัครสมาชิกสำเร็จ!</h2>
            <p className="text-[.85rem] md:text-[.88rem] text-[#64748B] leading-relaxed mb-6">
              ยินดีต้อนรับสู่ <strong className="text-[#3F6FAF]">NovelLib</strong> คุณ{' '}
              <strong>{form.username}</strong>!<br />
              {serverError ? serverError : `เราได้ส่งอีเมลยืนยันไปที่ ${form.email} แล้ว`}
            </p>
            <a
              href="/login"
              className="inline-block w-full py-3 md:py-2.5 rounded-lg bg-[#3F6FAF] text-white text-[.92rem] font-semibold cursor-pointer no-underline text-center transition-all hover:bg-[#2E568C] hover:shadow-[0_4px_16px_rgba(43,94,171,.35)] mb-3"
            >
              เข้าสู่ระบบ
            </a>
            <Link
              href="/"
              className="inline-block w-full py-3 md:py-2.5 rounded-lg border border-[#DCE5F0] text-[.88rem] font-semibold text-[#64748B] no-underline text-center transition-all hover:border-[#3F6FAF] hover:text-[#3F6FAF] hover:bg-[#E8F0FA] mb-3"
            >
              🏠 ไปหน้าหลัก
            </Link>
            <button
              onClick={() => {
                setForm({ username: '', email: '', password: '', confirmPassword: '', agree: false });
                setErrors({});
                setActiveScreen('registerScreen');
              }}
              className="text-[.8rem] text-[#8795A8] hover:text-[#64748B] border-none bg-transparent cursor-pointer transition-colors"
            >
              กลับไปหน้าสมัคร
            </button>
          </div>
        </div>
      )}
    </>
  );
}
