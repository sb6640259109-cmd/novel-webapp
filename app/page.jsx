"use client";
import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import api from '@/lib/axios-client';
import NovelLibMark from '@/app/components/NovelLibMark';
import SettingsPanel from '@/app/components/SettingsPanel';

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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [readerFontSize, setReaderFontSize] = useState(18);
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
    if (!mobileMenuOpen && !notificationsOpen && !isDetailOpen) return;
    const closeOverlay = (event) => {
      if (event.key !== 'Escape') return;
      if (isDetailOpen) {
        setIsDetailOpen(false);
        setSelectedNovel(null);
        return;
      }
      if (mobileMenuOpen) setMobileMenuOpen(false);
      if (notificationsOpen) setNotificationsOpen(false);
    };
    window.addEventListener('keydown', closeOverlay);
    return () => window.removeEventListener('keydown', closeOverlay);
  }, [isDetailOpen, mobileMenuOpen, notificationsOpen]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedSize = Number(window.localStorage.getItem('readerFontSize'));
      const savedTheme = window.localStorage.getItem('readerTheme');
      if ([18, 24, 28].includes(savedSize)) setReaderFontSize(savedSize);
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
    <div className={`novellib-shell novellib-home flex h-[100dvh] min-h-[100dvh] overflow-hidden bg-[#F4F7FB] font-sans text-[15px] text-[#1B2A41] selection:bg-[#3F6FAF]/20 ${readerTheme === 'dark' ? 'site-dark' : 'site-light'}`}>

      {/* ── SIDEBAR (Desktop) ── */}
      <nav aria-label="เมนูหลัก" className="z-20 hidden h-[100dvh] w-[264px] shrink-0 flex-col border-r border-[#DCE5F0] bg-[#FFFFFF]/95 py-6 shadow-[12px_0_40px_rgba(23,32,42,.035)] backdrop-blur-xl lg:flex">
        <div className="flex items-center gap-2.5 px-6 pb-8 text-[1.15rem] font-bold text-[#3F6FAF]">
          <NovelLibMark className="w-[34px] h-[34px]" />
          NovelLib
        </div>
        <div className="mb-1.5 px-3">
          <div className="px-3 pb-2 text-[.68rem] font-semibold uppercase tracking-[.08em] text-[#64748B]">เมนูหลัก</div>
          <a href="#discover" aria-current={activeView === 'discover' ? 'page' : undefined} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-[.9rem] no-underline transition-colors ${activeView === 'discover' ? 'bg-[#E8F0FA] font-semibold text-[#3F6FAF]' : 'font-medium text-[#64748B] hover:bg-[#F4F7FB] hover:text-[#3F6FAF]'}`}>
            <span aria-hidden="true" className="w-5 text-center text-base">🧭</span> ค้นพบ
          </a>
          <a href="#library" aria-current={activeView === 'library' ? 'page' : undefined} className={`mt-1 flex min-h-11 items-center gap-3 rounded-xl px-3 text-[.9rem] no-underline transition-colors ${activeView === 'library' ? 'bg-[#E8F0FA] font-semibold text-[#3F6FAF]' : 'font-medium text-[#64748B] hover:bg-[#F4F7FB] hover:text-[#3F6FAF]'}`}>
            <span aria-hidden="true" className="w-5 text-center text-base">📖</span> ชั้นหนังสือ
          </a>
          {canManageNovels && <a href="/admin" className="mt-1 flex min-h-11 items-center gap-3 rounded-xl px-3 text-[.9rem] font-semibold text-[#3F6FAF] no-underline transition-colors hover:bg-[#E8F0FA]">
            <span className="w-5 grid place-items-center"><NovelManagementIcon /></span> {managementLabel}
          </a>}
        </div>
        {currentUser?.role === 'READER' && <a href="/author-apply" className="group mx-4 mt-5 block overflow-hidden rounded-2xl bg-[#203A5F] p-4 text-white no-underline shadow-[0_12px_28px_rgba(32,58,95,.2)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6F96C9]">
          <div className="flex items-start justify-between gap-3">
            <div><p className="text-[.65rem] font-bold uppercase tracking-[.12em] text-[#AFC8E8]">พื้นที่ของนักเล่าเรื่อง</p><p className="mt-1.5 text-base font-bold">อยากเขียนเรื่องของคุณ?</p></div>
            <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-lg">✍</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-white/70">สมัครเป็นนักเขียน แล้วเริ่มจัดการนิยายและตอนของคุณได้ในที่เดียว</p>
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-white">เริ่มสมัครนักเขียน <span className="transition-transform group-hover:translate-x-1">→</span></span>
        </a>}
        <div className="mx-4 mt-6 rounded-2xl border border-[#DCE5F0] bg-[#F7FAFD] p-4">
          <p className="text-[.68rem] font-bold uppercase tracking-[.08em] text-[#3F6FAF]">คลังนิยาย</p>
          <p className="mt-2 text-sm font-semibold text-[#1B2A41]">{loading ? 'กำลังเตรียมเรื่องน่าอ่าน' : `${novels.length} เรื่องพร้อมให้ค้นพบ`}</p>
          <p className="mt-1 text-xs leading-relaxed text-[#64748B]">เลือกประเภทที่ชอบ แล้วเก็บเรื่องโปรดไว้ในชั้นหนังสือของคุณ</p>
        </div>
        <div className="mt-auto border-t border-[#DCE5F0] px-4 pt-4">
          <a href={currentUser ? '/profile' : '/login'} className="flex min-h-14 items-center gap-3 rounded-xl px-2.5 no-underline text-inherit hover:bg-[#F4F7FB]">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#3F6FAF] to-[#6F96C9] text-[.9rem] font-bold text-white">{accountLabel.charAt(0).toUpperCase()}</div>
            <div className="leading-tight">
              <div className="text-[.88rem] font-semibold">{accountLabel}</div>
              <div className="mt-1 text-xs text-[#64748B]">{currentUser ? roleLabel : 'เข้าสู่ระบบ'}</div>
            </div>
          </a>
        </div>
      </nav>

      {/* ── MOBILE SIDEBAR OVERLAY ── */}
      {/* Always rendered, controlled via CSS transform + pointer-events */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="เมนูนำทาง"
        aria-hidden={!mobileMenuOpen}
        className="fixed inset-0 z-[300] transition-all duration-300 lg:hidden"
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
          aria-label="เมนูหลักบนมือถือ"
          className="absolute bottom-0 left-0 top-0 flex w-[min(86vw,320px)] flex-col bg-white py-6 shadow-2xl transition-transform duration-300"
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
              aria-label="ปิดเมนู"
              className="w-9 h-9 flex items-center justify-center text-[#8795A8] text-xl border-none bg-transparent cursor-pointer rounded-lg hover:bg-gray-100"
            >
              ✕
            </button>
          </div>

          <div className="px-3 mb-1.5 flex-1">
            <div className="text-[.68rem] font-semibold tracking-[.06em] text-[#8795A8] uppercase px-2 pb-1.5">เมนูหลัก</div>
            <a href="#discover" aria-current={activeView === 'discover' ? 'page' : undefined} onClick={() => setMobileMenuOpen(false)} className={`mb-1 flex min-h-12 items-center gap-3 rounded-xl px-3 text-[.9rem] no-underline ${activeView === 'discover' ? 'bg-[#E8F0FA] font-semibold text-[#3F6FAF]' : 'font-medium text-[#64748B] hover:bg-[#F4F7FB]'}`}>
              <span className="text-base w-5 text-center">🧭</span> ค้นพบ
            </a>
            <a href="#library" aria-current={activeView === 'library' ? 'page' : undefined} onClick={() => setMobileMenuOpen(false)} className={`mb-1 flex min-h-12 items-center gap-3 rounded-xl px-3 text-[.9rem] no-underline ${activeView === 'library' ? 'bg-[#E8F0FA] font-semibold text-[#3F6FAF]' : 'font-medium text-[#64748B] hover:bg-[#F4F7FB]'}`}>
              <span className="text-base w-5 text-center">📖</span> ชั้นหนังสือ
            </a>
            {canManageNovels && <a href="/admin" onClick={() => setMobileMenuOpen(false)} className="mt-1 flex items-center gap-2.5 py-3 px-2.5 rounded-lg text-[.9rem] font-semibold text-[#3F6FAF] no-underline bg-[#E8F0FA]/70 hover:bg-[#DCE9F8]">
              <span className="w-5 grid place-items-center"><NovelManagementIcon /></span> {managementLabel}
            </a>}
            {currentUser?.role === 'READER' && <a href="/author-apply" onClick={() => setMobileMenuOpen(false)} className="mt-4 block rounded-2xl bg-[#203A5F] p-4 text-white no-underline shadow-lg">
              <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-xl">✍</span><div><p className="font-bold">เขียนเรื่องของคุณ</p><p className="mt-0.5 text-xs text-white/70">สมัครเป็นนักเขียนกับ NovelLib</p></div></div>
              <span className="mt-3 block rounded-lg bg-white px-3 py-2 text-center text-sm font-bold text-[#203A5F]">เริ่มสมัครนักเขียน</span>
            </a>}
          </div>

          <div className="border-t border-[#DCE5F0] px-5 pt-4">
            {currentUser ? <a href="/profile" className="flex min-h-12 items-center justify-center rounded-xl border border-[#DCE5F0] bg-white px-4 text-sm font-semibold text-[#3F6FAF] no-underline">ดูโปรไฟล์ {accountLabel}</a> : <div className="flex gap-2">
              <a href="/login" className="flex-1 text-center py-2.5 rounded-lg border border-[#DCE5F0] text-[.84rem] font-semibold text-[#64748B] no-underline hover:border-[#3F6FAF] hover:text-[#3F6FAF]">
                เข้าสู่ระบบ
              </a>
              <a href="/register" className="flex-1 text-center py-2.5 rounded-lg bg-[#3F6FAF] text-white text-[.84rem] font-semibold no-underline hover:bg-[#2E568C]">
                สมัครสมาชิก
              </a>
            </div>}
          </div>
        </nav>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* TOP BAR */}
        <header className="z-30 flex min-h-[68px] shrink-0 items-center gap-3 border-b border-[#DCE5F0] bg-[#FFFFFF]/95 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">

          {/* Hamburger — mobile only */}
          <button
            type="button"
            className="-ml-2 flex h-11 w-11 items-center justify-center rounded-xl border-none bg-transparent text-[1.4rem] text-[#1B2A41] active:bg-gray-100 lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="เปิดเมนู"
          >
            ☰
          </button>

          <div className="min-w-0 shrink-0">
            <h1 className="truncate text-base font-bold text-[#1B2A41] sm:text-lg">{activeView === 'library' ? 'ชั้นหนังสือของฉัน' : 'ค้นพบนิยาย'}</h1>
            <p className="hidden text-xs text-[#64748B] lg:block">{activeView === 'library' ? 'เรื่องโปรดและประวัติการอ่านของคุณ' : 'เรื่องใหม่และเรื่องแนะนำที่คัดมาให้คุณ'}</p>
          </div>

          {/* Search — hidden on small mobile */}
          <div className="relative ml-2 hidden max-w-md flex-1 sm:block lg:ml-6">
            <span className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[#8795A8] text-[.9rem] pointer-events-none">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="ค้นหานิยายหรือนักเขียน"
              placeholder="ค้นหานิยาย, นักเขียน..."
              className="w-full rounded-xl border border-[#DCE5F0] bg-[#F4F7FB] py-2.5 pl-[38px] pr-4 text-[.87rem] text-[#1B2A41] outline-none transition-colors focus:border-[#6F96C9] focus:bg-white"
            />
          </div>

          <div className="ml-auto flex items-center gap-1.5 relative">
            {canManageNovels && <a href="/admin" title={managementLabel} aria-label={managementLabel} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#AFC8E8] bg-[#E8F0FA] text-[#3F6FAF] no-underline transition-all hover:border-[#6F96C9] hover:bg-[#D5E4F6]"><NovelManagementIcon /></a>}
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
            <button type="button" onClick={() => setNotificationsOpen((open) => !open)} aria-label="การแจ้งเตือน" aria-expanded={notificationsOpen} className={`grid h-10 w-10 place-items-center rounded-xl border text-[.9rem] transition-all hover:border-[#6F96C9] hover:bg-[#E8F0FA] hover:text-[#3F6FAF] ${notificationsOpen ? 'border-[#6F96C9] bg-[#E8F0FA] text-[#3F6FAF]' : 'border-[#DCE5F0] bg-white text-[#64748B]'}`}>🔔</button>
            <button type="button" onClick={() => setSettingsOpen(true)} aria-label="เปิดการตั้งค่า" title="ตั้งค่า" className="grid h-10 w-10 place-items-center rounded-xl border border-[#DCE5F0] bg-white text-[.9rem] text-[#64748B] transition-all hover:border-[#6F96C9] hover:bg-[#E8F0FA] hover:text-[#3F6FAF]">⚙️</button>
            {notificationsOpen && <div className="absolute right-0 top-12 z-50 w-[min(290px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#DCE5F0] bg-white shadow-[0_16px_40px_rgba(27,42,65,.16)]">
              <div className="flex items-center justify-between border-b border-[#E8EEF6] px-4 py-3">
                <span className="font-bold text-[#1B2A41]">การแจ้งเตือน</span>
                <button type="button" onClick={() => setNotificationsOpen(false)} aria-label="ปิดการแจ้งเตือน" className="border-0 bg-transparent text-[#8795A8] cursor-pointer">✕</button>
              </div>
              {currentUser ? <div className="p-3">
                <a href="#latest" onClick={() => setNotificationsOpen(false)} className="block rounded-lg bg-[#F4F7FB] p-3 text-sm text-[#1B2A41] no-underline hover:bg-[#E8F0FA]">
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
        <div className="shrink-0 border-b border-[#DCE5F0] bg-white px-4 py-3 sm:hidden">
          <div className="relative">
            <span className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[#8795A8] text-[.9rem] pointer-events-none">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="ค้นหานิยาย"
              placeholder="ค้นหานิยาย..."
              className="w-full rounded-xl border border-[#DCE5F0] bg-[#F4F7FB] py-2.5 pl-[38px] pr-4 text-[.87rem] text-[#1B2A41] outline-none transition-colors focus:border-[#6F96C9] focus:bg-white"
            />
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1280px] px-4 pb-28 pt-5 sm:px-6 sm:pt-7 lg:px-8 lg:pb-12 xl:px-10">

            {/* FEATURED BANNER */}
            {activeView === 'discover' && <section id="discover" aria-labelledby="featured-title" className="mb-8 grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,.75fr)] xl:items-stretch">
              <div className="relative h-[270px] overflow-hidden rounded-[24px] bg-gradient-to-br from-[#315b8e] via-[#5f88b6] to-[#9bb8d8] shadow-[0_18px_48px_rgba(31,49,45,.16)] ring-1 ring-white/20 sm:h-[330px] xl:h-[410px] xl:rounded-[30px]">
                {featuredNovel?.image && <div className="absolute inset-y-0 right-0 w-[52%] md:w-[45%]">
                  <Image src={featuredNovel.image} alt={`หน้าปกนิยาย ${featuredNovel.title}`} fill unoptimized priority loading="eager" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#315b8e]/45 via-[#315b8e]/10 to-transparent" />
                </div>}
                <div className="absolute inset-0 bg-gradient-to-r from-[#203A5F]/90 via-[#315b8e]/55 to-[#315b8e]/10" />
                <div className="relative z-10 flex h-full max-w-[88%] flex-col justify-end px-6 py-7 sm:max-w-[70%] sm:px-9 sm:py-9 xl:max-w-[68%] xl:px-11 xl:py-11">
                  <p className="mb-2 text-[.68rem] font-bold uppercase tracking-[.16em] text-[#8ED8F0] md:text-[.74rem]">แนะนำสำหรับคุณ • {featuredIndex + 1}/{featuredNovels.length || 1}</p>
                  <h2 id="featured-title" className="mb-3 line-clamp-2 font-serif text-3xl font-semibold leading-[1.08] text-white sm:text-4xl xl:text-5xl">{featuredNovel?.title || 'กำลังโหลดนิยายแนะนำ...'}</h2>
                  {featuredNovel && <><div className="mb-5 flex flex-wrap items-center gap-3"><span className="rounded-full border border-white/15 bg-white/15 px-3 py-1 text-xs font-medium text-white/90">{featuredNovel.genre}</span><span className="text-sm font-semibold text-[#FBBF24]">★ {Number(featuredNovel.rating).toFixed(1)}</span><span className="hidden text-sm text-white/75 sm:inline">{featuredNovel.author}</span></div><button type="button" onClick={() => openDetail(featuredNovel)} className="reader-hero-action inline-flex min-h-11 w-fit items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#315B8E] shadow-lg hover:bg-[#F4F7FB]"><span aria-hidden="true">📖</span> ดูรายละเอียด</button></>}
                </div>
                {featuredNovels.length > 1 && <div className="absolute right-4 top-4 z-20 flex gap-2"><button type="button" aria-label="เรื่องแนะนำก่อนหน้า" onClick={() => setFeaturedIndex((old) => (old - 1 + featuredNovels.length) % featuredNovels.length)} className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/20 text-2xl text-white backdrop-blur hover:bg-black/35">‹</button><button type="button" aria-label="เรื่องแนะนำถัดไป" onClick={() => setFeaturedIndex((old) => (old + 1) % featuredNovels.length)} className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/20 text-2xl text-white backdrop-blur hover:bg-black/35">›</button></div>}
                <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2">{featuredNovels.map((novel, index) => <button key={novel.id} type="button" aria-label={`แสดง ${novel.title}`} onClick={() => setFeaturedIndex(index)} className="grid h-11 w-11 place-items-center"><span className={`block h-2 rounded-full transition-all ${index === featuredIndex ? 'w-7 bg-white' : 'w-2 bg-white/45'}`} /></button>)}</div>
              </div>
              <aside className="hidden flex-col rounded-[28px] border border-[#DCE5F0] bg-white p-7 shadow-[0_14px_38px_rgba(27,42,65,.07)] xl:flex">
                <p className="text-xs font-bold uppercase tracking-[.14em] text-[#3F6FAF]">พื้นที่ของนักอ่าน</p>
                <h2 className="mt-3 text-2xl font-bold leading-tight text-[#1B2A41]">เลือกเรื่องที่ใช่ แล้วอ่านต่อได้ทุกเวลา</h2>
                <p className="mt-3 text-sm leading-6 text-[#64748B]">ค้นหาตามประเภท บันทึกเรื่องโปรด และกลับมาอ่านต่อจากประวัติของคุณได้ง่ายขึ้น</p>
                <dl className="mt-7 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#F4F7FB] p-4"><dt className="text-xs text-[#64748B]">นิยายทั้งหมด</dt><dd className="mt-1 text-2xl font-bold text-[#1B2A41]">{loading ? '—' : novels.length}</dd></div>
                  <div className="rounded-2xl bg-[#F4F7FB] p-4"><dt className="text-xs text-[#64748B]">ประเภทให้เลือก</dt><dd className="mt-1 text-2xl font-bold text-[#1B2A41]">{Math.max(genres.length - 1, 0)}</dd></div>
                </dl>
                <div className="mt-auto space-y-3 pt-7">
                  <a href="#library" className="flex min-h-11 items-center justify-center rounded-xl bg-[#3F6FAF] px-4 text-sm font-bold text-white no-underline hover:bg-[#2E568C]">เปิดชั้นหนังสือของฉัน</a>
                  <p className="text-center text-xs text-[#64748B]">{currentUser ? `เข้าสู่ระบบเป็น ${accountLabel}` : 'เข้าสู่ระบบเพื่อบันทึกเรื่องโปรดและประวัติการอ่าน'}</p>
                </div>
              </aside>
            </section>}

            <section id={activeView === 'library' ? 'library' : 'latest'} aria-labelledby="novel-list-title">
            {/* SECTION & TABS */}
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-[.12em] text-[#3F6FAF]">{activeView === 'library' ? 'พื้นที่ส่วนตัว' : 'เลือกอ่านได้เลย'}</p>
                <h2 id="novel-list-title" className="text-xl font-bold sm:text-2xl">{activeView === 'library' ? 'ชั้นหนังสือของฉัน' : 'นิยายอัปเดตล่าสุด'}</h2>
              </div>
              {!loading && <span className="shrink-0 rounded-full border border-[#DCE5F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#64748B]">{displayedNovels.length} เรื่อง</span>}
            </div>
            {activeView === 'discover' && <div aria-label="กรองตามประเภทนิยาย" className="mb-6 flex gap-2 overflow-x-auto pb-2">
              {genres.map((genre) => <button key={genre} type="button" aria-pressed={selectedGenre === genre} onClick={() => setSelectedGenre(genre)} className={`min-h-10 shrink-0 whitespace-nowrap rounded-full border px-4 text-[.82rem] font-semibold ${selectedGenre === genre ? 'border-[#3F6FAF] bg-[#3F6FAF] text-white' : 'border-[#DCE5F0] bg-white text-[#64748B] hover:border-[#AFC8E8] hover:bg-[#E8F0FA] hover:text-[#3F6FAF]'}`}>{genre}</button>)}
            </div>}

            {activeView === 'library' && !currentUser && <div className="mb-5 rounded-2xl border border-dashed bg-white p-6 text-center"><p className="text-slate-600">เข้าสู่ระบบเพื่อดูรายการโปรดและประวัติการอ่าน</p><a href="/login" className="mt-3 inline-block rounded-lg bg-[#3F6FAF] px-4 py-2 font-semibold text-white">เข้าสู่ระบบ</a></div>}
            {activeView === 'library' && currentUser && <div className="mb-5 rounded-2xl border bg-white p-4"><h4 className="font-bold">ประวัติอ่านล่าสุด</h4>{library.history.length ? <div className="mt-2 flex gap-2 overflow-x-auto">{library.history.slice(0, 10).map((item) => <div key={item.id} className="min-w-56 rounded-xl bg-slate-50 p-3 text-sm"><p className="font-semibold">{item.novelTitle}</p><p className="text-slate-500">{item.chapterTitle || 'เนื้อหาหลัก'} • {item.progress}%</p></div>)}</div> : <p className="mt-2 text-sm text-slate-500">ยังไม่มีประวัติการอ่าน</p>}</div>}

            {/* NOVEL GRID */}
            <div className="mb-8 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {error && !loading ? (
                <div role="alert" className="col-span-full rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                  <p className="font-semibold text-red-700">{error}</p>
                  <p className="mt-1 text-sm text-red-600">ตรวจสอบ Wi-Fi แล้วลองโหลดข้อมูลอีกครั้ง</p>
                  <button type="button" onClick={reloadPage} className="mt-4 rounded-lg bg-[#3F6FAF] px-4 py-2 text-sm font-semibold text-white">ลองใหม่</button>
                </div>
              ) : loading || libraryLoading ? (
                <div role="status" className="col-span-full rounded-2xl border border-dashed border-[#C7D2FE] bg-white/70 p-6 text-sm text-[#64748B]">
                  กำลังโหลดนิยายจากเซิร์ฟเวอร์...
                </div>
              ) : error || libraryError ? (
                <div role="alert" className="col-span-full rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
                  {error || libraryError}
                </div>
              ) : displayedNovels.length === 0 ? (
                <div role="status" className="col-span-full rounded-2xl border border-dashed border-[#DCE5F0] bg-white/80 p-6 text-sm text-[#64748B]">
                  {activeView === 'library' ? 'ยังไม่มีนิยายในรายการโปรด' : 'ยังไม่พบนิยายที่ตรงกับการค้นหา'}
                </div>
              ) : (
                displayedNovels.map((novel) => (
                  <article key={novel.id} className="group overflow-hidden rounded-[20px] border border-[#DCE5F0]/90 bg-[#FFFFFF] shadow-[0_8px_24px_rgba(23,32,42,.055)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_38px_rgba(23,32,42,.11)]">
                    <button type="button" aria-label={`เปิดรายละเอียดนิยาย ${novel.title}`} onClick={() => openDetail(novel)} className="block w-full p-2.5 pb-4 text-left">
                    <div className="relative mb-3 aspect-[2/3] w-full overflow-hidden rounded-[14px] bg-gradient-to-br from-[#2F5785] via-[#5781B2] to-[#3F6FAF] shadow-sm">
                      <div className="absolute inset-0 flex items-center justify-center text-3xl" aria-hidden="true">📖</div>
                      {novel.image && (
                        <Image
                          src={novel.image}
                          alt={`หน้าปกนิยาย ${novel.title}`}
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
                          className="z-[1] object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <span className="absolute left-2 top-2 z-[2] max-w-[80%] truncate rounded-full border border-white/20 bg-black/35 px-2.5 py-1 text-[.65rem] font-semibold text-white shadow-sm backdrop-blur">{novel.genre}</span>
                    </div>
                    <h3 className="line-clamp-2 min-h-[2.6em] text-[.88rem] font-bold leading-[1.3] text-[#1B2A41] sm:text-[.92rem]">{novel.title}</h3>
                    <p className="mt-1 truncate text-xs text-[#64748B]">{novel.author}</p>
                    <div className="mt-2 flex items-center justify-between gap-2 text-xs"><span className="font-bold text-[#D97706]">★ {novel.rating.toFixed(1)}</span><span className="text-[#64748B]">ดูรายละเอียด →</span></div>
                    </button>
                  </article>
                ))
              )}
            </div>
            </section>
          </div>
        </div>

        {/* MOBILE BOTTOM NAV */}
        <nav aria-label="เมนูด้านล่าง" className="flex shrink-0 border-t border-[#DCE5F0] bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
          <a href="#discover" aria-current={activeView === 'discover' ? 'page' : undefined} className={`flex min-h-16 flex-1 flex-col items-center justify-center gap-1 no-underline ${activeView === 'discover' ? 'text-[#3F6FAF]' : 'text-[#64748B]'}`}>
            <span aria-hidden="true" className="text-lg">🧭</span>
            <span className="text-xs font-semibold">ค้นพบ</span>
          </a>
          <a href="#library" aria-current={activeView === 'library' ? 'page' : undefined} className={`flex min-h-16 flex-1 flex-col items-center justify-center gap-1 no-underline ${activeView === 'library' ? 'text-[#3F6FAF]' : 'text-[#64748B]'}`}>
            <span aria-hidden="true" className="text-lg">📖</span>
            <span className="text-xs font-semibold">ชั้นหนังสือ</span>
          </a>
          {canManageNovels && <a href="/admin" className="flex min-h-16 flex-1 flex-col items-center justify-center gap-1 no-underline text-[#3F6FAF]">
            <NovelManagementIcon className="w-[18px] h-[18px]" />
            <span className="text-xs font-semibold">{managementLabel}</span>
          </a>}
          <a href={currentUser ? '/profile' : '/login'} className="flex min-h-16 flex-1 flex-col items-center justify-center gap-1 no-underline text-[#64748B]">
            <span aria-hidden="true" className="text-lg">👤</span>
            <span className="text-xs font-semibold">{currentUser ? 'โปรไฟล์' : 'เข้าสู่ระบบ'}</span>
          </a>
        </nav>
      </main>

      {/* ── DETAIL OVERLAY (SIDE SHEET) ── */}
      {selectedNovel && <div
        className={`fixed inset-0 bg-black/35 z-[100] transition-opacity duration-300 ${isDetailOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeDetail}
      />}
      {selectedNovel && <div role="dialog" aria-modal="true" aria-label={`รายละเอียดนิยาย ${selectedNovel.title}`} className={`fixed bottom-0 right-0 top-0 z-[101] flex w-full max-w-[460px] flex-col overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ${isDetailOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-[180px] md:h-[200px] bg-gradient-to-br from-[#1a1a2e] to-[#3F6FAF] relative flex items-center justify-center overflow-hidden">
          {selectedNovel.image && <Image src={selectedNovel.image} alt={selectedNovel.title} fill unoptimized className="object-cover opacity-35" />}
          <button type="button" aria-label="ปิดรายละเอียดนิยาย" onClick={closeDetail} className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white transition hover:bg-black/35">✕</button>
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
          <div className={`absolute inset-x-0 top-0 h-1 ${readerTheme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}><div className="h-full bg-[#3F6FAF] transition-[width] duration-150" style={{ width: `${readingProgress}%` }} /></div>
          <div className="mx-auto flex h-full w-full max-w-5xl flex-col p-4 pt-5 md:p-6 md:pt-7">
            <div className={`mb-4 flex flex-col gap-3 border-b pb-4 md:mb-5 md:flex-row md:items-center md:justify-between ${readerTheme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
              <div><p className="text-sm text-[#6F96C9]">{selectedNovel.title}</p><h2 className="font-bold text-lg md:text-xl">{selectedChapter?.title || selectedNovel.title}</h2></div>
              <div className="flex flex-wrap items-center gap-2">
                <div className={`flex items-center rounded-lg border p-1 ${readerTheme === 'dark' ? 'border-slate-600 bg-slate-800' : 'border-slate-200 bg-slate-50'}`} aria-label="ขนาดตัวหนังสือ">
                  {[18, 24, 28].map((size) => <button key={size} type="button" onClick={() => changeReaderFontSize(size)} className={`rounded-md px-2.5 py-1 text-xs font-semibold ${readerFontSize === size ? 'bg-[#3F6FAF] text-white' : 'bg-transparent'}`}>{size}px</button>)}
                </div>
                <div className={`flex items-center rounded-lg border p-1 ${readerTheme === 'dark' ? 'border-slate-600 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
                  <button type="button" onClick={() => changeReaderTheme('light')} className={`rounded-md px-2.5 py-1 text-xs font-semibold ${readerTheme === 'light' ? 'bg-white text-[#1B2A41] shadow-sm' : 'text-slate-300'}`}>☀ สว่าง</button>
                  <button type="button" onClick={() => changeReaderTheme('dark')} className={`rounded-md px-2.5 py-1 text-xs font-semibold ${readerTheme === 'dark' ? 'bg-[#3F6FAF] text-white' : 'text-slate-600'}`}>🌙 มืด</button>
                </div>
                <button type="button" className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${readerTheme === 'dark' ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={closeReader}>ปิด</button>
              </div>
            </div>
            <div onScroll={(event) => { const element = event.currentTarget; const maximum = element.scrollHeight - element.clientHeight; setReadingProgress(maximum > 0 ? Math.round((element.scrollTop / maximum) * 100) : 100); }} style={{ fontSize: `${readerFontSize}px` }} className={`flex-1 overflow-auto pb-12 leading-[1.9] ${readerTheme === 'dark' ? 'text-slate-200' : 'text-gray-700'}`}>
              <p className="mx-auto w-full max-w-[70ch] whitespace-pre-wrap">{selectedChapter?.content || selectedNovel.content || 'ตอนนี้ยังไม่มีเนื้อหา'}</p>
            </div>
          </div>
        </div>
      )}
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} currentUser={currentUser} readerTheme={readerTheme} onReaderThemeChange={changeReaderTheme} />
    </div>
  );
}
