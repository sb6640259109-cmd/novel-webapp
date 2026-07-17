"use client";
import React, { useEffect, useState } from 'react';
import api from '@/lib/axios-client';

export default function Homepage() {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadNovels = async () => {
      try {
        const response = await api.get('/novels');
        setNovels(response.data.novels || []);
      } catch (err) {
        setError('ไม่สามารถโหลดนิยายได้ในขณะนี้');
      } finally {
        setLoading(false);
      }
    };

    loadNovels();
  }, []);

  const openDetail = () => setIsDetailOpen(true);
  const closeDetail = () => setIsDetailOpen(false);

  return (
    <div className="flex h-screen bg-[#F0F4FA] text-[#111827] font-sans text-[15px] overflow-hidden">

      {/* ── SIDEBAR (Desktop) ── */}
      <nav className="w-[220px] shrink-0 bg-white border-r border-[#E2E8F2] py-6 h-screen flex-col hidden md:flex z-20">
        <div className="flex items-center gap-[9px] px-5 pb-7 font-bold text-[1.1rem] text-[#2B5EAB]">
          <div className="w-[34px] h-[34px] bg-[#2B5EAB] rounded-[9px] grid place-items-center text-white text-base">📚</div>
          NovelLib
        </div>
        <div className="px-3 mb-1.5">
          <div className="text-[.68rem] font-semibold tracking-[.06em] text-[#9CA3AF] uppercase px-2 pb-1.5">เมนูหลัก</div>
          <a href="#discover" className="flex items-center gap-2.5 py-[9px] px-2.5 rounded-lg text-[.88rem] transition-all duration-150 no-underline bg-[#EEF3FB] text-[#2B5EAB] font-semibold">
            <span className="text-base w-5 text-center">🧭</span> ค้นพบ
          </a>
          <a href="#library" className="flex items-center gap-2.5 py-[9px] px-2.5 rounded-lg text-[.88rem] font-medium text-[#4B5563] transition-all duration-150 no-underline hover:bg-[#EEF3FB] hover:text-[#2B5EAB]">
            <span className="text-base w-5 text-center">📖</span> ชั้นหนังสือ
          </a>
          <a href="#updates" className="flex items-center gap-2.5 py-[9px] px-2.5 rounded-lg text-[.88rem] font-medium text-[#4B5563] transition-all duration-150 no-underline hover:bg-[#EEF3FB] hover:text-[#2B5EAB]">
            <span className="text-base w-5 text-center">✨</span> อัปเดต
            <span className="ml-auto bg-[#2B5EAB] text-white text-[.68rem] font-bold py-[2px] px-[7px] rounded-full">3</span>
          </a>
        </div>
        <div className="mt-auto pt-4 px-5 border-t border-[#E2E8F2]">
          <div className="flex items-center gap-2.5 py-2.5 cursor-pointer hover:bg-gray-50 rounded-lg px-2">
            <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] grid place-items-center text-white font-bold text-[.9rem] shrink-0">U</div>
            <div className="leading-tight">
              <div className="text-[.85rem] font-semibold">User Name</div>
              <div className="text-[.72rem] text-[#9CA3AF]">Free Plan</div>
            </div>
          </div>
        </div>
      </nav>

      {/* ── MOBILE SIDEBAR OVERLAY ── */}
      {/* Always rendered, controlled via CSS transform + pointer-events */}
      <div
        className="fixed inset-0 z-[300] transition-all duration-300"
        style={{
          pointerEvents: mobileMenuOpen ? 'auto' : 'none',
          visibility: mobileMenuOpen ? 'visible' : 'hidden',
        }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 transition-opacity duration-300"
          style={{ opacity: mobileMenuOpen ? 1 : 0 }}
          onClick={() => setMobileMenuOpen(false)}
        />
        {/* Drawer */}
        <nav
          className="absolute left-0 top-0 bottom-0 w-[270px] bg-white flex flex-col py-6 shadow-2xl transition-transform duration-300"
          style={{ transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)' }}
        >
          <div className="flex items-center justify-between px-5 pb-6">
            <div className="flex items-center gap-[9px] font-bold text-[1.1rem] text-[#2B5EAB]">
              <div className="w-[34px] h-[34px] bg-[#2B5EAB] rounded-[9px] grid place-items-center text-white text-base">📚</div>
              NovelLib
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="w-9 h-9 flex items-center justify-center text-[#9CA3AF] text-xl border-none bg-transparent cursor-pointer rounded-lg hover:bg-gray-100"
            >
              ✕
            </button>
          </div>

          <div className="px-3 mb-1.5 flex-1">
            <div className="text-[.68rem] font-semibold tracking-[.06em] text-[#9CA3AF] uppercase px-2 pb-1.5">เมนูหลัก</div>
            <a href="#discover" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 py-3 px-2.5 rounded-lg text-[.9rem] no-underline bg-[#EEF3FB] text-[#2B5EAB] font-semibold mb-1">
              <span className="text-base w-5 text-center">🧭</span> ค้นพบ
            </a>
            <a href="#library" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 py-3 px-2.5 rounded-lg text-[.9rem] font-medium text-[#4B5563] no-underline hover:bg-[#EEF3FB] hover:text-[#2B5EAB] mb-1">
              <span className="text-base w-5 text-center">📖</span> ชั้นหนังสือ
            </a>
            <a href="#updates" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 py-3 px-2.5 rounded-lg text-[.9rem] font-medium text-[#4B5563] no-underline hover:bg-[#EEF3FB] hover:text-[#2B5EAB]">
              <span className="text-base w-5 text-center">✨</span> อัปเดต
              <span className="ml-auto bg-[#2B5EAB] text-white text-[.68rem] font-bold py-[2px] px-[7px] rounded-full">3</span>
            </a>
          </div>

          <div className="px-5 pt-4 border-t border-[#E2E8F2]">
            <div className="flex gap-2">
              <a href="/login" className="flex-1 text-center py-2.5 rounded-lg border border-[#E2E8F2] text-[.84rem] font-semibold text-[#4B5563] no-underline hover:border-[#2B5EAB] hover:text-[#2B5EAB]">
                เข้าสู่ระบบ
              </a>
              <a href="/register" className="flex-1 text-center py-2.5 rounded-lg bg-[#2B5EAB] text-white text-[.84rem] font-semibold no-underline hover:bg-[#1A3E7C]">
                สมัครสมาชิก
              </a>
            </div>
          </div>
        </nav>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* TOP BAR */}
        <header className="bg-white border-b border-[#E2E8F2] py-3 px-4 md:py-[14px] md:px-7 flex items-center gap-3 shrink-0 z-10">

          {/* Hamburger — mobile only */}
          <button
            type="button"
            className="md:hidden flex items-center justify-center w-11 h-11 -ml-2 rounded-xl text-[#111827] text-[1.4rem] cursor-pointer border-none bg-transparent active:bg-gray-100"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="เปิดเมนู"
          >
            ☰
          </button>

          <div className="text-[.95rem] md:text-[1.05rem] font-bold text-[#111827] truncate">ค้นพบ</div>

          {/* Search — hidden on small mobile */}
          <div className="flex-1 max-w-[320px] relative hidden sm:block">
            <span className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[#9CA3AF] text-[.9rem] pointer-events-none">🔍</span>
            <input
              type="text"
              placeholder="ค้นหานิยาย, นักเขียน..."
              className="w-full py-2 pr-[14px] pl-[36px] border border-[#E2E8F2] rounded-lg text-[.87rem] bg-[#F0F4FA] text-[#111827] outline-none transition-colors focus:border-[#4B8EE8] focus:bg-white"
            />
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <a href="/login" className="hidden sm:inline-flex py-1.5 px-3 rounded-lg border border-[#E2E8F2] bg-white text-[.8rem] font-semibold text-[#4B5563] no-underline transition-all hover:border-[#2B5EAB] hover:text-[#2B5EAB] hover:bg-[#EEF3FB]">
              เข้าสู่ระบบ
            </a>
            <a href="/register" className="hidden sm:inline-flex py-1.5 px-3 rounded-lg bg-[#2B5EAB] text-white text-[.8rem] font-semibold no-underline transition-all hover:bg-[#1A3E7C]">
              สมัครสมาชิก
            </a>
            <div className="hidden sm:block w-px h-5 bg-[#E2E8F2] mx-0.5" />
            <button type="button" className="w-[34px] h-[34px] rounded-lg border border-[#E2E8F2] bg-white grid place-items-center cursor-pointer text-[.9rem] text-[#4B5563] transition-all hover:bg-[#EEF3FB] hover:text-[#2B5EAB] hover:border-[#4B8EE8]">🔔</button>
            <button type="button" className="hidden sm:grid w-[34px] h-[34px] rounded-lg border border-[#E2E8F2] bg-white place-items-center cursor-pointer text-[.9rem] text-[#4B5563] transition-all hover:bg-[#EEF3FB] hover:text-[#2B5EAB] hover:border-[#4B8EE8]">⚙️</button>
          </div>
        </header>

        {/* Mobile search bar */}
        <div className="sm:hidden px-4 py-2.5 bg-white border-b border-[#E2E8F2] shrink-0">
          <div className="relative">
            <span className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[#9CA3AF] text-[.9rem] pointer-events-none">🔍</span>
            <input
              type="text"
              placeholder="ค้นหานิยาย..."
              className="w-full py-2 pr-[14px] pl-[36px] border border-[#E2E8F2] rounded-lg text-[.87rem] bg-[#F0F4FA] text-[#111827] outline-none transition-colors focus:border-[#4B8EE8] focus:bg-white"
            />
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-7 pb-24 md:pb-7">

            {/* FEATURED BANNER */}
            <div
              className="rounded-[16px] md:rounded-[20px] overflow-hidden h-[180px] md:h-[240px] bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] relative mb-5 md:mb-7 cursor-pointer"
              onClick={openDetail}
            >
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent" />
              <div className="absolute right-0 top-0 bottom-0 w-[200px] md:w-[260px] bg-gradient-to-l from-transparent to-[#1a1a2e] opacity-55" />
              <div className="relative z-10 py-6 px-5 md:py-8 md:px-9 h-full flex flex-col justify-end">
                <div className="text-[.68rem] md:text-[.72rem] font-bold tracking-widest text-[#7EC8E3] uppercase mb-1.5 md:mb-2">แนะนำสำหรับคุณ</div>
                <h2 className="font-serif text-xl md:text-3xl font-semibold text-white leading-tight mb-2 max-w-[260px] md:max-w-[340px]">The Starfall Chronicles</h2>
                <div className="flex items-center gap-3 mb-3 md:mb-4">
                  <span className="text-[.68rem] md:text-[.72rem] py-[3px] px-[9px] rounded-full bg-white/15 text-white/85 font-medium">แฟนตาซี</span>
                  <span className="text-[#F59E0B] text-[.78rem] md:text-[.8rem]">★ 4.9</span>
                </div>
                <button type="button" className="inline-flex items-center gap-[7px] bg-[#2B5EAB] text-white py-2 md:py-[9px] px-4 md:px-5 rounded-lg text-[.82rem] md:text-[.85rem] font-semibold cursor-pointer border-none transition-colors hover:bg-[#1A3E7C] w-fit">
                  <span>📖</span> เริ่มอ่านเลย
                </button>
              </div>
            </div>

            {/* SECTION & TABS */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[.95rem] md:text-base font-bold">อัปเดตล่าสุด</h3>
              <a href="#all" className="text-[.8rem] text-[#2B5EAB] font-semibold cursor-pointer no-underline hover:underline">ดูทั้งหมด</a>
            </div>
            <div className="flex gap-1 mb-4 md:mb-[18px] overflow-x-auto pb-1">
              <button type="button" className="py-1.5 px-3 md:px-3.5 rounded-lg text-[.8rem] md:text-[.82rem] font-medium cursor-pointer text-white border-none bg-[#2B5EAB] whitespace-nowrap shrink-0">ทั้งหมด</button>
              <button type="button" className="py-1.5 px-3 md:px-3.5 rounded-lg text-[.8rem] md:text-[.82rem] font-medium cursor-pointer text-[#4B5563] border-none bg-transparent hover:bg-[#EEF3FB] hover:text-[#2B5EAB] whitespace-nowrap shrink-0">แฟนตาซี</button>
              <button type="button" className="py-1.5 px-3 md:px-3.5 rounded-lg text-[.8rem] md:text-[.82rem] font-medium cursor-pointer text-[#4B5563] border-none bg-transparent hover:bg-[#EEF3FB] hover:text-[#2B5EAB] whitespace-nowrap shrink-0">โรแมนติก</button>
              <button type="button" className="py-1.5 px-3 md:px-3.5 rounded-lg text-[.8rem] md:text-[.82rem] font-medium cursor-pointer text-[#4B5563] border-none bg-transparent hover:bg-[#EEF3FB] hover:text-[#2B5EAB] whitespace-nowrap shrink-0">สืบสวน</button>
            </div>

            {/* NOVEL GRID */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3 md:gap-3.5 mb-8">
              {loading ? (
                <div className="col-span-full rounded-lg border border-dashed border-[#C7D2FE] bg-white/70 p-4 text-sm text-[#4B5563]">
                  กำลังโหลดนิยายจากเซิร์ฟเวอร์...
                </div>
              ) : error ? (
                <div className="col-span-full rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              ) : novels.length === 0 ? (
                <div className="col-span-full rounded-lg border border-dashed border-[#E2E8F2] bg-white/80 p-4 text-sm text-[#4B5563]">
                  ยังไม่มีนิยายในระบบตอนนี้
                </div>
              ) : (
                novels.map((novel) => (
                  <div key={novel.id} className="cursor-pointer group" onClick={openDetail}>
                    <div className="w-full aspect-[2/3] rounded-lg overflow-hidden relative mb-2 shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg bg-gradient-to-br from-[#1a1a2e] to-[#4B8EE8]">
                      <div className="w-full h-full flex items-center justify-center text-3xl">📖</div>
                      <span className="absolute top-1.5 left-1.5 text-[.6rem] md:text-[.65rem] font-bold py-0.5 px-1.5 rounded uppercase bg-[#10B981] text-white">ใหม่</span>
                    </div>
                    <div className="text-[.78rem] md:text-[.8rem] font-semibold leading-snug mb-0.5 text-[#111827]">{novel.title}</div>
                    <div className="text-[.7rem] md:text-[.72rem] text-[#9CA3AF]">{novel.author}</div>
                    <div className="flex items-center gap-1 text-[.7rem] md:text-[.72rem] text-[#F59E0B] font-semibold mt-1">★ {novel.rating.toFixed(1)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* MOBILE BOTTOM NAV */}
        <div className="md:hidden shrink-0 bg-white border-t border-[#E2E8F2] flex">
          <a href="#discover" className="flex-1 flex flex-col items-center py-2.5 gap-0.5 no-underline text-[#2B5EAB]">
            <span className="text-lg">🧭</span>
            <span className="text-[.62rem] font-semibold">ค้นพบ</span>
          </a>
          <a href="#library" className="flex-1 flex flex-col items-center py-2.5 gap-0.5 no-underline text-[#9CA3AF]">
            <span className="text-lg">📖</span>
            <span className="text-[.62rem] font-medium">ชั้นหนังสือ</span>
          </a>
          <a href="#updates" className="flex-1 flex flex-col items-center py-2.5 gap-0.5 no-underline text-[#9CA3AF] relative">
            <span className="text-lg">✨</span>
            <span className="text-[.62rem] font-medium">อัปเดต</span>
            <span className="absolute top-1.5 right-[calc(50%-16px)] w-4 h-4 bg-[#2B5EAB] text-white text-[.5rem] font-bold rounded-full grid place-items-center">3</span>
          </a>
          <a href="/login" className="flex-1 flex flex-col items-center py-2.5 gap-0.5 no-underline text-[#9CA3AF]">
            <span className="text-lg">👤</span>
            <span className="text-[.62rem] font-medium">เข้าสู่ระบบ</span>
          </a>
        </div>
      </main>

      {/* ── DETAIL OVERLAY (SIDE SHEET) ── */}
      <div
        className={`fixed inset-0 bg-black/35 z-[100] transition-opacity duration-300 ${isDetailOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeDetail}
      />
      <div className={`fixed right-0 top-0 bottom-0 w-full max-w-[440px] bg-white z-[101] overflow-y-auto transition-transform duration-300 flex flex-col ${isDetailOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-[180px] md:h-[200px] bg-gradient-to-br from-[#1a1a2e] to-[#2B5EAB] relative flex items-center justify-center">
          <button type="button" onClick={closeDetail} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 rounded-full w-8 h-8 flex items-center justify-center text-white border-none cursor-pointer transition">❌</button>
          <h2 className="text-white text-xl md:text-2xl font-bold z-10">รายละเอียดนิยาย</h2>
        </div>
        <div className="p-5 md:p-7">
          <p className="text-[#4B5563] text-[.9rem] leading-relaxed mb-5">เรื่องย่อหรือรายละเอียดจะแสดงที่นี่...</p>
          <button
            type="button"
            className="inline-flex items-center justify-center w-full gap-[7px] bg-[#2B5EAB] text-white py-2.5 rounded-lg text-[.9rem] font-semibold cursor-pointer border-none transition-colors hover:bg-[#1A3E7C]"
            onClick={() => setIsReaderOpen(true)}
          >
            อ่านเรื่องนี้
          </button>
        </div>
      </div>

      {/* ── READER OVERLAY ── */}
      {isReaderOpen && (
        <div className="fixed inset-0 bg-white z-[200] flex flex-col">
          <div className="p-4 md:p-5 max-w-4xl w-full mx-auto flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 md:mb-5 border-b pb-4">
              <h2 className="font-bold text-lg md:text-xl text-[#111827]">หน้าอ่านนิยาย</h2>
              <button type="button" className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-200 transition" onClick={() => setIsReaderOpen(false)}>ปิด</button>
            </div>
            <div className="flex-1 overflow-auto text-base md:text-lg leading-loose text-gray-700 pb-10">
              <p>เนื้อหานิยาย...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}