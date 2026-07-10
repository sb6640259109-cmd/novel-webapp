"use client";
import React, { useState } from 'react';

export default function Homepage() {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReaderOpen, setIsReaderOpen] = useState(false);

  const openDetail = () => setIsDetailOpen(true);
  const closeDetail = () => setIsDetailOpen(false);

  return (
    <div className="flex min-h-screen bg-[#F0F4FA] text-[#111827] font-sans text-[15px]">
      {/* ── SIDEBAR ── */}
      <nav className="w-[220px] shrink-0 bg-white border-r border-[#E2E8F2] py-6 sticky top-0 h-screen flex flex-col hidden md:flex">
        <div className="flex items-center gap-[9px] px-5 pb-7 font-bold text-[1.1rem] text-[#2B5EAB]">
          <div className="w-[34px] h-[34px] bg-[#2B5EAB] rounded-[9px] grid place-items-center text-white text-base">📚</div>
          NovelLib
        </div>
        <div className="px-3 mb-1.5">
          <div className="text-[.68rem] font-semibold tracking-[.06em] text-[#9CA3AF] uppercase px-2 pb-1.5">เมนูหลัก</div>
          <a href="#discover" className="flex items-center gap-2.5 py-[9px] px-2.5 rounded-lg cursor-pointer text-[.88rem] transition-all duration-150 no-underline bg-[#EEF3FB] text-[#2B5EAB] font-semibold">
            <span className="text-base w-5 text-center">🧭</span> ค้นพบ
          </a>
          <a href="#library" className="flex items-center gap-2.5 py-[9px] px-2.5 rounded-lg cursor-pointer text-[.88rem] font-medium text-[#4B5563] transition-all duration-150 no-underline hover:bg-[#EEF3FB] hover:text-[#2B5EAB]">
            <span className="text-base w-5 text-center">📖</span> ชั้นหนังสือ
          </a>
          <a href="#updates" className="flex items-center gap-2.5 py-[9px] px-2.5 rounded-lg cursor-pointer text-[.88rem] font-medium text-[#4B5563] transition-all duration-150 no-underline hover:bg-[#EEF3FB] hover:text-[#2B5EAB]">
            <span className="text-base w-5 text-center">✨</span> อัปเดต 
            <span className="ml-auto bg-[#2B5EAB] text-white text-[.68rem] font-bold py-[2px] px-[7px] rounded-full">3</span>
          </a>
        </div>
        
        <div className="mt-auto pt-4 px-5 border-t border-[#E2E8F2]">
          <div className="flex items-center gap-2.5 py-2.5 cursor-pointer hover:bg-gray-50 rounded-lg">
            <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] grid place-items-center text-white font-bold text-[.9rem] shrink-0">U</div>
            <div className="leading-tight">
              <div className="text-[.85rem] font-semibold">User Name</div>
              <div className="text-[.72rem] text-[#9CA3AF]">Free Plan</div>
            </div>
          </div>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-auto">
        {/* TOP BAR */}
        <header className="bg-white border-b border-[#E2E8F2] py-[14px] px-7 flex items-center gap-[14px] sticky top-0 z-10">
          <div className="text-[1.05rem] font-bold text-[#111827]">ค้นพบ (Discover)</div>
          <div className="flex-1 max-w-[360px] relative hidden sm:block">
            <span className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[#9CA3AF] text-[.9rem] pointer-events-none">🔍</span>
            <input 
              type="text" 
              placeholder="ค้นหานิยาย, นักเขียน, หรือแท็ก..." 
              className="w-full py-2 pr-[14px] pl-[36px] border border-[#E2E8F2] rounded-lg text-[.87rem] bg-[#F0F4FA] text-[#111827] outline-none transition-colors focus:border-[#4B8EE8] focus:bg-white"
            />
          </div>
          <div className="ml-auto flex gap-2">
            <button className="w-[36px] h-[36px] rounded-lg border border-[#E2E8F2] bg-white grid place-items-center cursor-pointer text-[.95rem] text-[#4B5563] transition-all hover:bg-[#EEF3FB] hover:text-[#2B5EAB] hover:border-[#4B8EE8]">🔔</button>
            <button className="w-[36px] h-[36px] rounded-lg border border-[#E2E8F2] bg-white grid place-items-center cursor-pointer text-[.95rem] text-[#4B5563] transition-all hover:bg-[#EEF3FB] hover:text-[#2B5EAB] hover:border-[#4B8EE8]">⚙️</button>
          </div>
        </header>

        <div className="p-7">
          {/* FEATURED BANNER */}
          <div className="rounded-[20px] overflow-hidden h-[240px] bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] relative mb-7 cursor-pointer" onClick={openDetail}>
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent"></div>
            <div className="absolute right-0 top-0 bottom-0 w-[260px] bg-gradient-to-l from-transparent to-[#1a1a2e] opacity-55"></div>
            <div className="relative z-10 py-8 px-9 h-full flex flex-col justify-end">
              <div className="text-[.72rem] font-bold tracking-widest text-[#7EC8E3] uppercase mb-2">แนะนำสำหรับคุณ</div>
              <h2 className="font-serif text-3xl font-semibold text-white leading-tight mb-2 max-w-[340px]">The Starfall Chronicles</h2>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[.72rem] py-[3px] px-[9px] rounded-full bg-white/15 text-white/85 font-medium">แฟนตาซี</span>
                <span className="text-[#F59E0B] text-[.8rem]">★ 4.9</span>
              </div>
              <button className="inline-flex items-center gap-[7px] bg-[#2B5EAB] text-white py-[9px] px-5 rounded-lg text-[.85rem] font-semibold cursor-pointer border-none transition-colors hover:bg-[#1A3E7C] w-fit">
                <span>📖</span> เริ่มอ่านเลย
              </button>
            </div>
          </div>

          {/* SECTION & TABS */}
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-base font-bold">อัปเดตล่าสุด</h3>
            <a href="#all" className="text-[.8rem] text-[#2B5EAB] font-semibold cursor-pointer no-underline hover:underline">ดูทั้งหมด</a>
          </div>
          <div className="flex gap-1 mb-[18px]">
            <button className="py-1.5 px-3.5 rounded-lg text-[.82rem] font-medium cursor-pointer text-white transition-colors border-none bg-[#2B5EAB]">ทั้งหมด</button>
            <button className="py-1.5 px-3.5 rounded-lg text-[.82rem] font-medium cursor-pointer text-[#4B5563] transition-colors border-none bg-transparent hover:bg-[#EEF3FB] hover:text-[#2B5EAB]">แฟนตาซี</button>
            <button className="py-1.5 px-3.5 rounded-lg text-[.82rem] font-medium cursor-pointer text-[#4B5563] transition-colors border-none bg-transparent hover:bg-[#EEF3FB] hover:text-[#2B5EAB]">โรแมนติก</button>
            <button className="py-1.5 px-3.5 rounded-lg text-[.82rem] font-medium cursor-pointer text-[#4B5563] transition-colors border-none bg-transparent hover:bg-[#EEF3FB] hover:text-[#2B5EAB]">สืบสวน</button>
          </div>

          {/* NOVEL GRID */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3.5 mb-8">
            <div className="cursor-pointer group" onClick={openDetail}>
              <div className="w-full aspect-[2/3] rounded-lg overflow-hidden relative mb-2 shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg bg-gradient-to-br from-[#1a1a2e] to-[#4B8EE8]">
                <div className="w-full h-full flex items-center justify-center text-3xl">🗡️</div>
                <span className="absolute top-1.5 left-1.5 text-[.65rem] font-bold py-0.5 px-1.5 rounded uppercase bg-[#10B981] text-white">ใหม่</span>
              </div>
              <div className="text-[.8rem] font-semibold leading-snug mb-0.5 text-[#111827]">ดาบมังกรหยก</div>
              <div className="text-[.72rem] text-[#9CA3AF]">Jin Yong</div>
              <div className="flex items-center gap-1 text-[.72rem] text-[#F59E0B] font-semibold mt-1">★ 4.8</div>
            </div>
            {/* คุณสามารถใช้การ Map รายการนิยายอื่นๆ ได้ตามต้องการ */}
          </div>
        </div>
      </main>

      {/* ── DETAIL OVERLAY (SIDE SHEET) ── */}
      <div 
        className={`fixed inset-0 bg-black/35 z-[100] transition-opacity duration-300 ${isDetailOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={closeDetail} 
      ></div>
      <div className={`fixed right-0 top-0 bottom-0 w-full max-w-[440px] bg-white z-[101] overflow-y-auto transition-transform duration-300 flex flex-col ${isDetailOpen ? 'translate-x-0' : 'translate-x-full'}`}>
         <div className="h-[200px] bg-gradient-to-br from-[#1a1a2e] to-[#2B5EAB] relative flex items-center justify-center">
           <button onClick={closeDetail} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 rounded-full w-8 h-8 flex items-center justify-center text-white border-none cursor-pointer transition">❌</button>
           <h2 className="text-white text-2xl font-bold z-10">รายละเอียดนิยาย</h2>
         </div>
         <div className="p-7">
            <p className="text-[#4B5563] text-[.9rem] leading-relaxed mb-5">เรื่องย่อหรือรายละเอียดจะแสดงที่นี่...</p>
            <button 
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
          <div className="p-5 max-w-4xl w-full mx-auto flex flex-col h-full">
             <div className="flex justify-between items-center mb-5 border-b pb-4">
                 <h2 className="font-bold text-xl text-[#111827]">หน้าอ่านนิยาย</h2>
                 <button className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-200 transition" onClick={() => setIsReaderOpen(false)}>ปิด</button>
             </div>
             <div className="flex-1 overflow-auto text-lg leading-loose text-gray-700 pb-10">
                <p>เนื้อหานิยาย...</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}