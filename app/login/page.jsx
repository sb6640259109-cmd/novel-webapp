"use client";
import React, { useState } from 'react';

export default function Login() {
  const [activeScreen, setActiveScreen] = useState('authScreen'); // 'authScreen' หรือ 'appScreen'

  return (
    <>
      {activeScreen === 'authScreen' && (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0f1b3d] via-[#1a3a7c] to-[#0d2654] relative overflow-hidden font-sans p-6">
          
          <div className="relative z-10 flex flex-col md:flex-row gap-0 rounded-[20px] overflow-hidden shadow-[0_8px_32px_rgba(43,94,171,.14)] w-full max-w-[820px] bg-white">
            {/* ฝั่งซ้ายแบนเนอร์ */}
            <div className="w-full md:w-[320px] shrink-0 bg-gradient-to-br from-[#1c2e6b] to-[#2B5EAB] py-10 px-8 flex flex-col justify-between hidden md:flex">
              <div>
                <div className="flex items-center gap-2.5 text-[1.3rem] font-bold text-white mb-12">
                  <div className="w-10 h-10 bg-white/20 rounded-[10px] grid place-items-center text-[1.2rem]">📚</div>
                  NovelLib
                </div>
                <div className="font-serif text-[1.05rem] text-white/85 leading-relaxed italic mb-4">
                  "การอ่านคือการเดินทางผ่านมิติและเวลา โดยไม่ต้องก้าวเท้าออกจากบ้าน"
                </div>
                <div className="text-[.78rem] text-white/50">— โลกแห่งการอ่าน</div>
              </div>
              <div className="text-[.78rem] text-white/45 leading-relaxed">
                &copy; 2026 NovelLib Platform.<br />All rights reserved.
              </div>
            </div>

            {/* ฝั่งขวาฟอร์มเข้าสู่ระบบ */}
            <div className="flex-1 bg-white py-10 px-9 flex flex-col justify-center">
              <div className="text-[.72rem] font-bold tracking-widest text-[#4B8EE8] uppercase mb-1.5">ยินดีต้อนรับกลับมา</div>
              <h1 className="text-[1.55rem] font-bold text-[#111827] mb-1.5 leading-snug">เข้าสู่ระบบ</h1>
              <div className="text-[.85rem] text-[#4B5563] mb-7 leading-relaxed">เพื่อเข้าถึงชั้นหนังสือและนิยายที่คุณติดตามไว้</div>

              <form onSubmit={(e) => { e.preventDefault(); setActiveScreen('appScreen'); }}>
                <div className="mb-3.5">
                  <label className="text-[.8rem] font-semibold text-[#111827] block mb-1">อีเมล</label>
                  <div className="relative">
                    <span className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[.9rem] text-[#9CA3AF] pointer-events-none">✉️</span>
                    <input 
                      type="email" 
                      className="w-full py-[9px] pr-3 pl-[34px] border-[1.5px] border-[#E2E8F2] rounded-lg text-[.88rem] text-[#111827] bg-[#F0F4FA] outline-none transition-colors focus:border-[#4B8EE8] focus:bg-white" 
                      placeholder="you@example.com" 
                      required 
                    />
                  </div>
                </div>

                <div className="mb-3.5">
                  <label className="text-[.8rem] font-semibold text-[#111827] block mb-1">รหัสผ่าน</label>
                  <div className="relative">
                    <span className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[.9rem] text-[#9CA3AF] pointer-events-none">🔒</span>
                    <input 
                      type="password" 
                      className="w-full py-[9px] pr-3 pl-[34px] border-[1.5px] border-[#E2E8F2] rounded-lg text-[.88rem] text-[#111827] bg-[#F0F4FA] outline-none transition-colors focus:border-[#4B8EE8] focus:bg-white" 
                      placeholder="••••••••" 
                      required 
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center mb-5 text-[.8rem]">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" className="accent-[#2B5EAB]" />
                    <span className="text-[#111827]">จดจำฉันไว้ในระบบ</span>
                  </label>
                  <a href="#forgot" className="text-[#2B5EAB] font-semibold cursor-pointer no-underline hover:underline">ลืมรหัสผ่าน?</a>
                </div>

                <button type="submit" className="w-full py-2.5 rounded-lg bg-[#2B5EAB] text-white border-none text-[.92rem] font-semibold cursor-pointer transition-colors hover:bg-[#1A3E7C] mb-3.5">
                  เข้าสู่ระบบ
                </button>

                <div className="text-center text-[#9CA3AF] text-[.78rem] my-3.5 relative flex items-center justify-center">
                  <div className="absolute left-0 w-[40%] h-px bg-[#E2E8F2]"></div>
                  <span className="bg-white px-2 relative z-10">หรือเข้าสู่ระบบด้วย</span>
                  <div className="absolute right-0 w-[40%] h-px bg-[#E2E8F2]"></div>
                </div>

                <button type="button" className="w-full py-2.5 rounded-lg border-[1.5px] border-[#E2E8F2] bg-white text-[.88rem] font-semibold cursor-pointer text-[#4B5563] transition-colors hover:border-[#2B5EAB] hover:text-[#2B5EAB] flex items-center justify-center gap-2 mb-4">
                  <span className="font-bold text-lg">G</span> Google
                </button>

                <div className="text-center text-[.82rem] text-[#4B5563]">
                  ยังไม่มีบัญชีใช่ไหม? <a href="#register" className="text-[#2B5EAB] font-semibold cursor-pointer no-underline hover:underline">สมัครสมาชิก</a>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* เมื่อเข้าสู่ระบบสำเร็จ จะแสดงส่วนนี้ (สามารถนำ Homepage มาแทนที่ได้) */}
      {activeScreen === 'appScreen' && (
        <div className="flex min-h-screen items-center justify-center bg-[#F0F4FA] font-sans flex-col gap-4">
           <h2 className="text-2xl font-bold text-[#2B5EAB]">เข้าสู่ระบบสำเร็จ - ยินดีต้อนรับสู่ NovelLib!</h2>
           <button 
             onClick={() => setActiveScreen('authScreen')}
             className="px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
           >
             ออกจากระบบ
           </button>
        </div>
      )}
    </>
  );
}