"use client";
import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import api from '@/lib/axios-client';
import NovelLibMark from '@/app/components/NovelLibMark';

function NovelManagementIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
      <path d="M11 3h4.5A2.5 2.5 0 0 1 18 5.5V10" />
      <path d="m14.5 17.5 5-5a1.4 1.4 0 0 1 2 2l-5 5-3 .7.7-3Z" />
    </svg>
  );
}

export default function Homepage() {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [selectedNovel, setSelectedNovel] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('ทั้งหมด');
  const [currentUser, setCurrentUser] = useState(null);
  const [engagement, setEngagement] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeView, setActiveView] = useState('discover');
  const [library, setLibrary] = useState({ favorites: [], history: [] });
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState('');
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readerFontSize, setReaderFontSize] = useState(16);
  const [readerTheme, setReaderTheme] = useState('light');
  const canManageNovels = currentUser?.role === 'AUTHOR' || currentUser?.role === 'ADMIN';
  const managementLabel = currentUser?.role === 'ADMIN' ? 'ดูแลระบบ' : 'จัดการนิยาย';
  const accountLabel = currentUser?.username || 'บัญชีผู้ใช้';
  const roleLabel = currentUser?.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : currentUser?.role === 'AUTHOR' ? 'นักเขียน' : 'ผู้อ่าน';

  const genres = useMemo(() => ['ทั้งหมด', ...new Set(novels.map((novel) => novel.genre).filter(Boolean))], [novels]);
  const filteredNovels = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return novels.filter((novel) => {
      const matchesGenre = selectedGenre === 'ทั้งหมด' || novel.genre === selectedGenre;
      const matchesSearch = !keyword || [novel.title, novel.author, novel.genre]
        .some((value) => value?.toLowerCase().includes(keyword));
      return matchesGenre && matchesSearch;
    });
  }, [novels, search, selectedGenre]);
  const displayedNovels = activeView === 'library'
    ? library.favorites.filter((novel) => !search.trim() || [novel.title, novel.author, novel.genre].some((value) => value?.toLowerCase().includes(search.trim().toLowerCase())))
    : filteredNovels;
  const featuredNovels = useMemo(() => {
    const withCovers = novels.filter((novel) => novel.image);
    return (withCovers.length ? withCovers : novels).slice(0, 6);
  }, [novels]);
  const featuredNovel = featuredNovels[featuredIndex % Math.max(featuredNovels.length, 1)];

  const reloadPage = () => window.location.reload();

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
    api.get('/auth/session').then((response) => {
      if (response.data.authenticated) setCurrentUser(response.data.user);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const syncView = () => setActiveView(window.location.hash === '#library' ? 'library' : 'discover');
    const timer = window.setTimeout(syncView, 0);
    window.addEventListener('hashchange', syncView);
    return () => { window.clearTimeout(timer); window.removeEventListener('hashchange', syncView); };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedSize = Number(window.localStorage.getItem('readerFontSize'));
      const savedTheme = window.localStorage.getItem('readerTheme');
      if ([14, 16, 18].includes(savedSize)) setReaderFontSize(savedSize);
      if (savedTheme === 'dark' || savedTheme === 'light') setReaderTheme(savedTheme);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const changeReaderFontSize = (size) => {
    setReaderFontSize(size);
    window.localStorage.setItem('readerFontSize', String(size));
  };

  const changeReaderTheme = (theme) => {
    setReaderTheme(theme);
    window.localStorage.setItem('readerTheme', theme);
  };

  useEffect(() => {
    if (activeView !== 'library') return;
    if (!currentUser) return;
    const timer = window.setTimeout(() => {
      setLibraryLoading(true);
      setLibraryError('');
      api.get('/reader/library')
        .then((response) => setLibrary(response.data))
        .catch((error) => setLibraryError(error.response?.data?.message || 'โหลดชั้นหนังสือไม่สำเร็จ'))
        .finally(() => setLibraryLoading(false));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [activeView, currentUser]);

  const openDetail = async (novel) => {
    if (!novel) return;
    setSelectedNovel(novel);
    setSelectedChapter(null);
    setChapters([]);
    setIsDetailOpen(true);
    setChaptersLoading(true);
    try {
      const [chapterResponse, engagementResponse] = await Promise.all([
        api.get(`/novels/${novel.id}/chapters`),
        api.get(`/novels/${novel.id}/engagement`),
      ]);
      setChapters(chapterResponse.data.chapters || []);
      setEngagement(engagementResponse.data.engagement);
    } catch {
      setChapters([]);
    } finally {
      setChaptersLoading(false);
    }
  };
  const closeDetail = () => {
    setIsDetailOpen(false);
    if (!isReaderOpen) setSelectedNovel(null);
  };
  const closeReader = () => {
    saveProgress(readingProgress);
    setIsReaderOpen(false);
    setSelectedChapter(null);
    setSelectedNovel(null);
  };

  const openReader = (chapter = null) => {
    setSelectedChapter(chapter);
    setIsDetailOpen(false);
    setIsReaderOpen(true);
    setReadingProgress(0);
    saveProgress(0, chapter);
  };

  const saveProgress = (progress, chapter = selectedChapter) => {
    if (!currentUser || !selectedNovel) return;
    api.post('/reader/history', {
      novelId: selectedNovel.id,
      novelTitle: selectedNovel.title,
      chapterId: chapter?.id || null,
      chapterTitle: chapter?.title || null,
      progress,
    }).catch(() => {});
  };

  const engage = async (action, extra = {}) => {
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }
    const response = await api.post(`/novels/${selectedNovel.id}/engagement`, { action, ...extra });
    setEngagement(response.data.engagement);
    if (action === 'comment') setCommentText('');
  };

  const deleteComment = async (commentId) => {
    const response = await api.delete(`/novels/${selectedNovel.id}/engagement?commentId=${commentId}`);
    setEngagement(response.data.engagement);
  };

  return (
    <div className="flex h-screen bg-[#F4F7FB] text-[#1B2A41] font-sans text-[15px] overflow-hidden selection:bg-[#3F6FAF]/20">

      {/* ── SIDEBAR (Desktop) ── */}
      <nav className="w-[248px] shrink-0 bg-[#FFFFFF]/95 border-r border-[#DCE5F0] py-7 h-screen flex-col hidden md:flex z-20 shadow-[12px_0_40px_rgba(23,32,42,.035)] backdrop-blur-xl">
        <div className="flex items-center gap-[9px] px-5 pb-7 font-bold text-[1.1rem] text-[#3F6FAF]">
          <NovelLibMark className="w-[34px] h-[34px]" />
          NovelLib
        </div>
        <div className="px-3 mb-1.5">
          <div className="text-[.68rem] font-semibold tracking-[.06em] text-[#8795A8] uppercase px-2 pb-1.5">เมนูหลัก</div>
          <a href="#discover" className="flex items-center gap-2.5 py-[9px] px-2.5 rounded-lg text-[.88rem] transition-all duration-150 no-underline bg-[#E8F0FA] text-[#3F6FAF] font-semibold">
            <span className="text-base w-5 text-center">🧭</span> ค้นพบ
          </a>
          <a href="#library" className="flex items-center gap-2.5 py-[9px] px-2.5 rounded-lg text-[.88rem] font-medium text-[#64748B] transition-all duration-150 no-underline hover:bg-[#E8F0FA] hover:text-[#3F6FAF]">
            <span className="text-base w-5 text-center">📖</span> ชั้นหนังสือ
          </a>
          <a href="#updates" className="flex items-center gap-2.5 py-[9px] px-2.5 rounded-lg text-[.88rem] font-medium text-[#64748B] transition-all duration-150 no-underline hover:bg-[#E8F0FA] hover:text-[#3F6FAF]">
            <span className="text-base w-5 text-center">✨</span> อัปเดต
            <span className="ml-auto bg-[#3F6FAF] text-white text-[.68rem] font-bold py-[2px] px-[7px] rounded-full">3</span>
          </a>
          {canManageNovels && <a href="/admin" className="mt-1 flex items-center gap-2.5 py-[9px] px-2.5 rounded-lg text-[.88rem] font-semibold text-[#3F6FAF] transition-all duration-150 no-underline bg-[#E8F0FA]/70 hover:bg-[#DCE9F8]">
            <span className="w-5 grid place-items-center"><NovelManagementIcon /></span> {managementLabel}
          </a>}
        </div>
        <div className="mt-auto pt-4 px-5 border-t border-[#DCE5F0]">
          <a href={currentUser ? '/profile' : '/login'} className="flex items-center gap-2.5 py-2.5 hover:bg-gray-50 rounded-lg px-2 no-underline text-inherit">
            <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] grid place-items-center text-white font-bold text-[.9rem] shrink-0">{accountLabel.charAt(0).toUpperCase()}</div>
            <div className="leading-tight">
              <div className="text-[.85rem] font-semibold">{accountLabel}</div>
              <div className="text-[.72rem] text-[#8795A8]">{currentUser ? roleLabel : 'เข้าสู่ระบบ'}</div>
            </div>
          </a>
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
            <div className="flex items-center gap-[9px] font-bold text-[1.1rem] text-[#3F6FAF]">
              <NovelLibMark className="w-[34px] h-[34px]" />
              NovelLib
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="w-9 h-9 flex items-center justify-center text-[#8795A8] text-xl border-none bg-transparent cursor-pointer rounded-lg hover:bg-gray-100"
            >
              ✕
            </button>
          </div>

          <div className="px-3 mb-1.5 flex-1">
            <div className="text-[.68rem] font-semibold tracking-[.06em] text-[#8795A8] uppercase px-2 pb-1.5">เมนูหลัก</div>
            <a href="#discover" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 py-3 px-2.5 rounded-lg text-[.9rem] no-underline bg-[#E8F0FA] text-[#3F6FAF] font-semibold mb-1">
              <span className="text-base w-5 text-center">🧭</span> ค้นพบ
            </a>
            <a href="#library" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 py-3 px-2.5 rounded-lg text-[.9rem] font-medium text-[#64748B] no-underline hover:bg-[#E8F0FA] hover:text-[#3F6FAF] mb-1">
              <span className="text-base w-5 text-center">📖</span> ชั้นหนังสือ
            </a>
            <a href="#updates" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 py-3 px-2.5 rounded-lg text-[.9rem] font-medium text-[#64748B] no-underline hover:bg-[#E8F0FA] hover:text-[#3F6FAF]">
              <span className="text-base w-5 text-center">✨</span> อัปเดต
              <span className="ml-auto bg-[#3F6FAF] text-white text-[.68rem] font-bold py-[2px] px-[7px] rounded-full">3</span>
            </a>
            {canManageNovels && <a href="/admin" onClick={() => setMobileMenuOpen(false)} className="mt-1 flex items-center gap-2.5 py-3 px-2.5 rounded-lg text-[.9rem] font-semibold text-[#3F6FAF] no-underline bg-[#E8F0FA]/70 hover:bg-[#DCE9F8]">
              <span className="w-5 grid place-items-center"><NovelManagementIcon /></span> {managementLabel}
            </a>}
          </div>

          <div className="px-5 pt-4 border-t border-[#DCE5F0]">
            <div className="flex gap-2">
              <a href="/login" className="flex-1 text-center py-2.5 rounded-lg border border-[#DCE5F0] text-[.84rem] font-semibold text-[#64748B] no-underline hover:border-[#3F6FAF] hover:text-[#3F6FAF]">
                เข้าสู่ระบบ
              </a>
              <a href="/register" className="flex-1 text-center py-2.5 rounded-lg bg-[#3F6FAF] text-white text-[.84rem] font-semibold no-underline hover:bg-[#2E568C]">
                สมัครสมาชิก
              </a>
            </div>
          </div>
        </nav>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* TOP BAR */}
        <header className="bg-[#FFFFFF]/90 border-b border-[#DCE5F0] py-3 px-4 md:py-[16px] md:px-8 flex items-center gap-3 shrink-0 z-10 backdrop-blur-xl">

          {/* Hamburger — mobile only */}
          <button
            type="button"
            className="md:hidden flex items-center justify-center w-11 h-11 -ml-2 rounded-xl text-[#1B2A41] text-[1.4rem] cursor-pointer border-none bg-transparent active:bg-gray-100"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="เปิดเมนู"
          >
            ☰
          </button>

          <div className="text-[.95rem] md:text-[1.05rem] font-bold text-[#1B2A41] truncate">ค้นพบ</div>

          {/* Search — hidden on small mobile */}
          <div className="flex-1 max-w-[320px] relative hidden sm:block">
            <span className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[#8795A8] text-[.9rem] pointer-events-none">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ค้นหานิยาย, นักเขียน..."
              className="w-full py-2 pr-[14px] pl-[36px] border border-[#DCE5F0] rounded-lg text-[.87rem] bg-[#F4F7FB] text-[#1B2A41] outline-none transition-colors focus:border-[#6F96C9] focus:bg-white"
            />
          </div>

          <div className="ml-auto flex items-center gap-1.5 relative">
            {canManageNovels && <a href="/admin" title={managementLabel} aria-label={managementLabel} className="inline-flex w-[34px] h-[34px] rounded-lg border border-[#AFC8E8] bg-[#E8F0FA] items-center justify-center text-[#3F6FAF] no-underline transition-all hover:bg-[#D5E4F6] hover:border-[#6F96C9]"><NovelManagementIcon /></a>}
            {currentUser ? <a href="/profile" className="hidden sm:inline-flex py-1.5 px-3 rounded-lg border border-[#DCE5F0] bg-white text-[.8rem] font-semibold text-[#64748B] no-underline transition-all hover:border-[#3F6FAF] hover:text-[#3F6FAF] hover:bg-[#E8F0FA]">
              {accountLabel}
            </a> : <><a href="/login" className="hidden sm:inline-flex py-1.5 px-3 rounded-lg border border-[#DCE5F0] bg-white text-[.8rem] font-semibold text-[#64748B] no-underline transition-all hover:border-[#3F6FAF] hover:text-[#3F6FAF] hover:bg-[#E8F0FA]">
              เข้าสู่ระบบ
            </a>
            <a href="/register" className="hidden sm:inline-flex py-1.5 px-3 rounded-lg bg-[#3F6FAF] text-white text-[.8rem] font-semibold no-underline transition-all hover:bg-[#2E568C]">
              สมัครสมาชิก
            </a>
            </>}
            <div className="hidden sm:block w-px h-5 bg-[#DCE5F0] mx-0.5" />
            <button type="button" onClick={() => setNotificationsOpen((open) => !open)} aria-label="การแจ้งเตือน" aria-expanded={notificationsOpen} className={`w-[34px] h-[34px] rounded-lg border grid place-items-center cursor-pointer text-[.9rem] transition-all hover:bg-[#E8F0FA] hover:text-[#3F6FAF] hover:border-[#6F96C9] ${notificationsOpen ? 'border-[#6F96C9] bg-[#E8F0FA] text-[#3F6FAF]' : 'border-[#DCE5F0] bg-white text-[#64748B]'}`}>🔔</button>
            <a href={currentUser ? '/profile' : '/login'} aria-label="ตั้งค่าบัญชี" title="ตั้งค่าบัญชี" className="hidden sm:grid w-[34px] h-[34px] rounded-lg border border-[#DCE5F0] bg-white place-items-center text-[.9rem] text-[#64748B] no-underline transition-all hover:bg-[#E8F0FA] hover:text-[#3F6FAF] hover:border-[#6F96C9]">⚙️</a>
            {notificationsOpen && <div className="absolute right-0 top-11 z-50 w-[290px] overflow-hidden rounded-xl border border-[#DCE5F0] bg-white shadow-[0_16px_40px_rgba(27,42,65,.16)]">
              <div className="flex items-center justify-between border-b border-[#E8EEF6] px-4 py-3">
                <span className="font-bold text-[#1B2A41]">การแจ้งเตือน</span>
                <button type="button" onClick={() => setNotificationsOpen(false)} aria-label="ปิดการแจ้งเตือน" className="border-0 bg-transparent text-[#8795A8] cursor-pointer">✕</button>
              </div>
              {currentUser ? <div className="p-3">
                <a href="#updates" onClick={() => setNotificationsOpen(false)} className="block rounded-lg bg-[#F4F7FB] p-3 text-sm text-[#1B2A41] no-underline hover:bg-[#E8F0FA]">
                  <span className="font-semibold">ตรวจสอบนิยายอัปเดตล่าสุด</span>
                  <span className="mt-1 block text-xs text-[#8795A8]">มีรายการอัปเดตใหม่ในระบบ</span>
                </a>
              </div> : <div className="p-4 text-center text-sm text-[#64748B]">
                <p>เข้าสู่ระบบเพื่อดูการแจ้งเตือน</p>
                <a href="/login" className="mt-3 inline-block rounded-lg bg-[#3F6FAF] px-4 py-2 font-semibold text-white no-underline">เข้าสู่ระบบ</a>
              </div>}
            </div>}
          </div>
        </header>

        {/* Mobile search bar */}
        <div className="sm:hidden px-4 py-2.5 bg-white border-b border-[#DCE5F0] shrink-0">
          <div className="relative">
            <span className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[#8795A8] text-[.9rem] pointer-events-none">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ค้นหานิยาย..."
              className="w-full py-2 pr-[14px] pl-[36px] border border-[#DCE5F0] rounded-lg text-[.87rem] bg-[#F4F7FB] text-[#1B2A41] outline-none transition-colors focus:border-[#6F96C9] focus:bg-white"
            />
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8 lg:p-10 pb-24 md:pb-10 max-w-[1440px] w-full mx-auto">

            {/* FEATURED BANNER */}
            {activeView === 'discover' && <div className="relative mb-7 md:mb-10">
              <div className="relative h-[250px] overflow-hidden rounded-[22px] bg-gradient-to-br from-[#315b8e] via-[#5f88b6] to-[#9bb8d8] shadow-[0_16px_45px_rgba(31,49,45,.13)] ring-1 ring-white/20 md:h-[340px] md:rounded-[30px]">
                {featuredNovel?.image && <div className="absolute inset-y-0 right-0 w-[52%] md:w-[45%]">
                  <Image src={featuredNovel.image} alt={`หน้าปกนิยาย ${featuredNovel.title}`} fill unoptimized priority className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#315b8e]/45 via-[#315b8e]/10 to-transparent" />
                </div>}
                <div className="absolute inset-0 bg-gradient-to-r from-[#203A5F]/75 via-[#315b8e]/40 to-transparent" />
                <div className="relative z-10 flex h-full max-w-[72%] flex-col justify-end px-6 py-7 md:max-w-[66%] md:px-10 md:py-10">
                  <p className="mb-2 text-[.68rem] font-bold uppercase tracking-[.16em] text-[#8ED8F0] md:text-[.74rem]">แนะนำสำหรับคุณ • {featuredIndex + 1}/{featuredNovels.length || 1}</p>
                  <h2 className="mb-3 line-clamp-2 font-serif text-2xl font-semibold leading-tight text-white md:text-5xl">{featuredNovel?.title || 'กำลังโหลดนิยายแนะนำ...'}</h2>
                  {featuredNovel && <><div className="mb-4 flex flex-wrap items-center gap-3"><span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90">{featuredNovel.genre}</span><span className="text-sm font-semibold text-[#FBBF24]">★ {Number(featuredNovel.rating).toFixed(1)}</span><span className="hidden text-sm text-white/70 sm:inline">{featuredNovel.author}</span></div><button type="button" onClick={() => openDetail(featuredNovel)} className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#3F6FAF] px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#2E568C]"><span>📖</span> ดูรายละเอียด</button></>}
                </div>
                {featuredNovels.length > 1 && <><button type="button" aria-label="เรื่องแนะนำก่อนหน้า" onClick={() => setFeaturedIndex((old) => (old - 1 + featuredNovels.length) % featuredNovels.length)} className="absolute left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-xl text-white backdrop-blur hover:bg-black/40 md:left-4">‹</button><button type="button" aria-label="เรื่องแนะนำถัดไป" onClick={() => setFeaturedIndex((old) => (old + 1) % featuredNovels.length)} className="absolute right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-xl text-white backdrop-blur hover:bg-black/40 md:right-4">›</button></>}
                <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">{featuredNovels.map((novel, index) => <button key={novel.id} type="button" aria-label={`แสดง ${novel.title}`} onClick={() => setFeaturedIndex(index)} className={`h-2 rounded-full transition-all ${index === featuredIndex ? 'w-7 bg-white' : 'w-2 bg-white/45 hover:bg-white/70'}`} />)}</div>
              </div>
            </div>}

            {/* SECTION & TABS */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[.95rem] md:text-base font-bold">{activeView === 'library' ? 'ชั้นหนังสือของฉัน' : 'อัปเดตล่าสุด'}</h3>
              <a href="#all" className="text-[.8rem] text-[#3F6FAF] font-semibold cursor-pointer no-underline hover:underline">ดูทั้งหมด</a>
            </div>
            {activeView === 'discover' && <div className="flex gap-1 mb-4 md:mb-[18px] overflow-x-auto pb-1">
              {genres.map((genre) => <button key={genre} type="button" onClick={() => setSelectedGenre(genre)} className={`py-1.5 px-3 md:px-3.5 rounded-lg text-[.8rem] md:text-[.82rem] font-medium cursor-pointer border-none whitespace-nowrap shrink-0 ${selectedGenre === genre ? 'bg-[#3F6FAF] text-white' : 'bg-transparent text-[#64748B] hover:bg-[#E8F0FA] hover:text-[#3F6FAF]'}`}>{genre}</button>)}
            </div>}

            {activeView === 'library' && !currentUser && <div className="mb-5 rounded-2xl border border-dashed bg-white p-6 text-center"><p className="text-slate-600">เข้าสู่ระบบเพื่อดูรายการโปรดและประวัติการอ่าน</p><a href="/login" className="mt-3 inline-block rounded-lg bg-[#3F6FAF] px-4 py-2 font-semibold text-white">เข้าสู่ระบบ</a></div>}
            {activeView === 'library' && currentUser && <div className="mb-5 rounded-2xl border bg-white p-4"><h4 className="font-bold">ประวัติอ่านล่าสุด</h4>{library.history.length ? <div className="mt-2 flex gap-2 overflow-x-auto">{library.history.slice(0, 10).map((item) => <div key={item.id} className="min-w-56 rounded-xl bg-slate-50 p-3 text-sm"><p className="font-semibold">{item.novelTitle}</p><p className="text-slate-500">{item.chapterTitle || 'เนื้อหาหลัก'} • {item.progress}%</p></div>)}</div> : <p className="mt-2 text-sm text-slate-500">ยังไม่มีประวัติการอ่าน</p>}</div>}

            {/* NOVEL GRID */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(165px,1fr))] gap-5 md:gap-7 mb-8">
              {error && !loading ? (
                <div className="col-span-full rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                  <p className="font-semibold text-red-700">{error}</p>
                  <p className="mt-1 text-sm text-red-600">ตรวจสอบ Wi-Fi แล้วลองโหลดข้อมูลอีกครั้ง</p>
                  <button type="button" onClick={reloadPage} className="mt-4 rounded-lg bg-[#3F6FAF] px-4 py-2 text-sm font-semibold text-white">ลองใหม่</button>
                </div>
              ) : loading || libraryLoading ? (
                <div className="col-span-full rounded-lg border border-dashed border-[#C7D2FE] bg-white/70 p-4 text-sm text-[#64748B]">
                  กำลังโหลดนิยายจากเซิร์ฟเวอร์...
                </div>
              ) : error || libraryError ? (
                <div className="col-span-full rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                  {error || libraryError}
                </div>
              ) : displayedNovels.length === 0 ? (
                <div className="col-span-full rounded-lg border border-dashed border-[#DCE5F0] bg-white/80 p-4 text-sm text-[#64748B]">
                  {activeView === 'library' ? 'ยังไม่มีนิยายในรายการโปรด' : 'ยังไม่พบนิยายที่ตรงกับการค้นหา'}
                </div>
              ) : (
                displayedNovels.map((novel) => (
                  <div key={novel.id} className="cursor-pointer group rounded-[20px] bg-[#FFFFFF] p-2.5 pb-4 border border-[#DCE5F0]/80 shadow-[0_10px_30px_rgba(23,32,42,.055)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(23,32,42,.12)]" onClick={() => openDetail(novel)}>
                    <div className="w-full aspect-[2/3] rounded-[14px] overflow-hidden relative mb-3 shadow-sm transition-all duration-300 bg-gradient-to-br from-[#2F5785] via-[#5781B2] to-[#3F6FAF]">
                      <div className="absolute inset-0 flex items-center justify-center text-3xl" aria-hidden="true">📖</div>
                      {novel.image && (
                        <Image
                          src={novel.image}
                          alt={`หน้าปกนิยาย ${novel.title}`}
                          fill
                          unoptimized
                          sizes="(max-width: 768px) 45vw, 180px"
                          className="z-[1] object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <span className="absolute top-1.5 left-1.5 z-[2] text-[.6rem] md:text-[.65rem] font-bold py-0.5 px-1.5 rounded uppercase bg-[#10B981] text-white shadow-sm">ใหม่</span>
                    </div>
                    <div className="text-[.78rem] md:text-[.8rem] font-semibold leading-snug mb-0.5 text-[#1B2A41]">{novel.title}</div>
                    <div className="text-[.7rem] md:text-[.72rem] text-[#8795A8]">{novel.author}</div>
                    <div className="flex items-center gap-1 text-[.7rem] md:text-[.72rem] text-[#F59E0B] font-semibold mt-1">★ {novel.rating.toFixed(1)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* MOBILE BOTTOM NAV */}
        <div className="md:hidden shrink-0 bg-white border-t border-[#DCE5F0] flex">
          <a href="#discover" className="flex-1 flex flex-col items-center py-2.5 gap-0.5 no-underline text-[#3F6FAF]">
            <span className="text-lg">🧭</span>
            <span className="text-[.62rem] font-semibold">ค้นพบ</span>
          </a>
          <a href="#library" className="flex-1 flex flex-col items-center py-2.5 gap-0.5 no-underline text-[#8795A8]">
            <span className="text-lg">📖</span>
            <span className="text-[.62rem] font-medium">ชั้นหนังสือ</span>
          </a>
          <a href="#updates" className="flex-1 flex flex-col items-center py-2.5 gap-0.5 no-underline text-[#8795A8] relative">
            <span className="text-lg">✨</span>
            <span className="text-[.62rem] font-medium">อัปเดต</span>
            <span className="absolute top-1.5 right-[calc(50%-16px)] w-4 h-4 bg-[#3F6FAF] text-white text-[.5rem] font-bold rounded-full grid place-items-center">3</span>
          </a>
          {canManageNovels && <a href="/admin" className="flex-1 flex flex-col items-center py-2.5 gap-0.5 no-underline text-[#3F6FAF]">
            <NovelManagementIcon className="w-[18px] h-[18px]" />
            <span className="text-[.62rem] font-semibold">{managementLabel}</span>
          </a>}
          <a href={currentUser ? '/profile' : '/login'} className="flex-1 flex flex-col items-center py-2.5 gap-0.5 no-underline text-[#8795A8]">
            <span className="text-lg">👤</span>
            <span className="text-[.62rem] font-medium">{currentUser ? 'โปรไฟล์' : 'เข้าสู่ระบบ'}</span>
          </a>
        </div>
      </main>

      {/* ── DETAIL OVERLAY (SIDE SHEET) ── */}
      {selectedNovel && <div
        className={`fixed inset-0 bg-black/35 z-[100] transition-opacity duration-300 ${isDetailOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeDetail}
      />}
      {selectedNovel && <div className={`fixed right-0 top-0 bottom-0 w-full max-w-[440px] bg-white z-[101] overflow-y-auto transition-transform duration-300 flex flex-col ${isDetailOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-[180px] md:h-[200px] bg-gradient-to-br from-[#1a1a2e] to-[#3F6FAF] relative flex items-center justify-center overflow-hidden">
          {selectedNovel.image && <Image src={selectedNovel.image} alt={selectedNovel.title} fill unoptimized className="object-cover opacity-35" />}
          <button type="button" onClick={closeDetail} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 rounded-full w-8 h-8 flex items-center justify-center text-white border-none cursor-pointer transition">❌</button>
          <h2 className="text-white text-xl md:text-2xl font-bold z-10 px-12 text-center">{selectedNovel.title}</h2>
        </div>
        <div className="p-5 md:p-7">
          <p className="text-sm font-semibold text-[#1B2A41]">ผู้แต่ง: {selectedNovel.author}</p>
          <p className="mt-1 text-sm text-[#64748B]">ประเภท: {selectedNovel.genre} • ★ {Number(selectedNovel.rating).toFixed(1)}</p>
          <h3 className="mt-5 mb-2 font-semibold text-[#1B2A41]">เรื่องย่อ</h3>
          <p className="text-[#64748B] text-[.9rem] leading-relaxed mb-5 whitespace-pre-wrap">{selectedNovel.description?.trim() || 'ยังไม่มีเรื่องย่อ'}</p>
          {engagement && <div className="mb-5 rounded-2xl border bg-slate-50 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => engage('favorite')} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${engagement.isFavorite ? 'border-red-200 bg-red-50 text-red-600' : 'bg-white text-slate-600'}`}>{engagement.isFavorite ? '♥ อยู่ในรายการโปรด' : '♡ เพิ่มรายการโปรด'} ({engagement.favoriteCount})</button>
              <button type="button" onClick={() => engage('followNovel')} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${engagement.isFollowingNovel ? 'border-blue-300 bg-blue-50 text-[#3F6FAF]' : 'bg-white text-slate-600'}`}>{engagement.isFollowingNovel ? '✓ ติดตามนิยายแล้ว' : '+ ติดตามนิยาย'} ({engagement.followerCount || 0})</button>
              <button type="button" onClick={() => engage('followAuthor')} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${engagement.isFollowingAuthor ? 'border-violet-300 bg-violet-50 text-violet-700' : 'bg-white text-slate-600'}`}>{engagement.isFollowingAuthor ? '✓ ติดตามผู้แต่งแล้ว' : '+ ติดตามผู้แต่ง'}</button>
              <label className="text-sm text-slate-600">ให้คะแนน
                <select value={engagement.userRating || ''} onChange={(event) => engage('rating', { value: Number(event.target.value) })} className="ml-2 rounded-lg border bg-white px-2 py-2">
                  <option value="" disabled>เลือก</option>
                  {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value} ดาว</option>)}
                </select>
              </label>
              <span className="text-sm font-semibold text-amber-500">★ {engagement.averageRating.toFixed(1)} ({engagement.ratingCount})</span>
            </div>
            <div className="mt-4">
              <div className="flex gap-2"><input value={commentText} onChange={(event) => setCommentText(event.target.value)} maxLength={1000} placeholder={currentUser ? 'เขียนความคิดเห็น...' : 'เข้าสู่ระบบเพื่อแสดงความคิดเห็น'} className="min-w-0 flex-1 rounded-lg border bg-white px-3 py-2 text-sm" /><button type="button" disabled={!commentText.trim()} onClick={() => engage('comment', { text: commentText })} className="rounded-lg bg-[#3F6FAF] px-3 py-2 text-sm font-semibold text-white disabled:opacity-40">ส่ง</button></div>
              <div className="mt-3 max-h-40 space-y-2 overflow-y-auto">{engagement.comments.map((comment) => <div key={comment.id} className="rounded-lg bg-white p-2 text-sm"><div className="flex justify-between gap-2"><span className="font-semibold">{comment.username}</span>{currentUser?.role === 'ADMIN' && <button type="button" onClick={() => deleteComment(comment.id)} className="text-xs font-semibold text-red-500">ลบ</button>}</div><p className="mt-1 whitespace-pre-wrap text-slate-600">{comment.text}</p></div>)}</div>
            </div>
          </div>}
          <h3 className="mb-3 font-semibold text-[#1B2A41]">ตอนนิยาย</h3>
          {chaptersLoading && <p className="rounded-xl border border-dashed p-4 text-sm text-slate-500">กำลังโหลดตอน...</p>}
          {!chaptersLoading && chapters.length > 0 && <div className="space-y-2">
            {chapters.map((chapter, index) => <button key={chapter.id} type="button" onClick={() => openReader(chapter)} className="flex w-full items-center gap-3 rounded-xl border p-3 text-left hover:border-[#3F6FAF] hover:bg-[#E8F0FA]">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3F6FAF] text-sm font-bold text-white">{index + 1}</span>
              <span className="font-semibold">{chapter.title}</span>
            </button>)}
          </div>}
          {!chaptersLoading && chapters.length === 0 && selectedNovel.content?.trim() && <button type="button" onClick={() => openReader()} className="inline-flex w-full items-center justify-center rounded-lg bg-[#3F6FAF] py-2.5 font-semibold text-white hover:bg-[#2E568C]">อ่านเนื้อหาเดิม</button>}
          {!chaptersLoading && chapters.length === 0 && !selectedNovel.content?.trim() && <p className="rounded-xl border border-dashed p-4 text-center text-sm text-slate-500">นิยายเรื่องนี้ยังไม่มีตอนหรือเนื้อหา</p>}
        </div>
      </div>}

      {/* ── READER OVERLAY ── */}
      {isReaderOpen && selectedNovel && (
        <div className={`fixed inset-0 z-[200] flex flex-col transition-colors ${readerTheme === 'dark' ? 'bg-[#111827] text-slate-100' : 'bg-white text-[#1B2A41]'}`}>
          <div className="p-4 md:p-5 max-w-4xl w-full mx-auto flex flex-col h-full">
            <div className={`mb-4 flex flex-col gap-3 border-b pb-4 md:mb-5 md:flex-row md:items-center md:justify-between ${readerTheme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
              <div><p className="text-sm text-[#6F96C9]">{selectedNovel.title}</p><h2 className="font-bold text-lg md:text-xl">{selectedChapter?.title || selectedNovel.title}</h2></div>
              <div className="flex flex-wrap items-center gap-2">
                <div className={`flex items-center rounded-lg border p-1 ${readerTheme === 'dark' ? 'border-slate-600 bg-slate-800' : 'border-slate-200 bg-slate-50'}`} aria-label="ขนาดตัวหนังสือ">
                  {[14, 16, 18].map((size) => <button key={size} type="button" onClick={() => changeReaderFontSize(size)} className={`rounded-md px-2.5 py-1 text-xs font-semibold ${readerFontSize === size ? 'bg-[#3F6FAF] text-white' : 'bg-transparent'}`}>{size}</button>)}
                </div>
                <div className={`flex items-center rounded-lg border p-1 ${readerTheme === 'dark' ? 'border-slate-600 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
                  <button type="button" onClick={() => changeReaderTheme('light')} className={`rounded-md px-2.5 py-1 text-xs font-semibold ${readerTheme === 'light' ? 'bg-white text-[#1B2A41] shadow-sm' : 'text-slate-300'}`}>☀ สว่าง</button>
                  <button type="button" onClick={() => changeReaderTheme('dark')} className={`rounded-md px-2.5 py-1 text-xs font-semibold ${readerTheme === 'dark' ? 'bg-[#3F6FAF] text-white' : 'text-slate-600'}`}>🌙 มืด</button>
                </div>
                <button type="button" className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${readerTheme === 'dark' ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={closeReader}>ปิด</button>
              </div>
            </div>
            <div onScroll={(event) => { const element = event.currentTarget; const maximum = element.scrollHeight - element.clientHeight; setReadingProgress(maximum > 0 ? Math.round((element.scrollTop / maximum) * 100) : 100); }} style={{ fontSize: `${readerFontSize}px` }} className={`flex-1 overflow-auto leading-loose pb-10 ${readerTheme === 'dark' ? 'text-slate-200' : 'text-gray-700'}`}>
              <p className="whitespace-pre-wrap">{selectedChapter?.content || selectedNovel.content || 'ตอนนี้ยังไม่มีเนื้อหา'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
