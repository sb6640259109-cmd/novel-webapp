'use client';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios-client';
import ChapterManager from './ChapterManager';
import UserManager from './UserManager';
import ModerationManager from './ModerationManager';
import AuthorApplicationManager from './AuthorApplicationManager';

const blank = { title: '', author: '', genre: '', description: '', content: '', image: '' };

export default function AdminPanel({ role, userId }) {
  const router = useRouter();
  const [novels, setNovels] = useState([]), [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null), [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ type: '', text: '' });
  const [file, setFile] = useState(null), [preview, setPreview] = useState('');
  const [chapterNovelId, setChapterNovelId] = useState('');

  const load = async () => {
    setLoading(true);
    try { setNovels((await api.get('/novels?manage=1')).data.novels || []); }
    catch (e) { setNotice({ type: 'error', text: e.response?.data?.message || 'โหลดรายการนิยายไม่สำเร็จ' }); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => () => { if (preview.startsWith('blob:')) URL.revokeObjectURL(preview); }, [preview]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const manageable = role === 'ADMIN' ? novels : novels.filter((novel) => novel.ownerId === userId);
    return q ? manageable.filter((n) => [n.title, n.author, n.genre].some((v) => v?.toLowerCase().includes(q))) : manageable;
  }, [novels, query, role, userId]);
  const update = (key, value) => setForm((old) => ({ ...old, [key]: value }));
  const reset = () => { setForm(blank); setEditingId(null); setFile(null); setPreview(''); };

  const chooseFile = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type) || selected.size > 10 * 1024 * 1024) {
      e.target.value = '';
      return setNotice({ type: 'error', text: 'รูปปกต้องเป็น JPG, PNG หรือ WebP และมีขนาดไม่เกิน 10 MB' });
    }
    setFile(selected); setPreview(URL.createObjectURL(selected));
  };

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setNotice({ type: '', text: '' });
    try {
      let image = form.image || null;
      if (file) { const data = new FormData(); data.append('file', file); image = (await api.post('/uploads/novel-cover', data)).data.imageUrl; }
      editingId ? await api.put(`/novels/${editingId}`, { ...form, image }) : await api.post('/novels', { ...form, image });
      setNotice({ type: 'success', text: editingId ? 'แก้ไขนิยายใน Supabase แล้ว' : 'เพิ่มนิยายใน Supabase แล้ว' });
      reset(); await load();
    } catch (error) { setNotice({ type: 'error', text: error.response?.data?.message || 'บันทึกข้อมูลไม่สำเร็จ' }); }
    finally { setSaving(false); }
  };

  const edit = (n) => {
    setEditingId(n.id); setForm({ title: n.title, author: n.author, genre: n.genre, description: n.description, content: n.content || '', image: n.image || '' });
    setFile(null); setPreview(n.image || ''); window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const remove = async (n) => {
    if (!confirm(`ลบนิยาย “${n.title}” ใช่หรือไม่?`)) return;
    try { await api.delete(`/novels/${n.id}`); setNotice({ type: 'success', text: 'ลบนิยายแล้ว' }); await load(); }
    catch (e) { setNotice({ type: 'error', text: e.response?.data?.message || 'ลบนิยายไม่สำเร็จ' }); }
  };
  const logout = async () => { try { await api.post('/auth/logout'); } finally { router.push('/login'); } };
  const manageChapters = (novel) => {
    setChapterNovelId(String(novel.id));
    window.setTimeout(() => document.getElementById('chapter-manager')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  return <main data-role={role} className="novellib-admin min-h-screen bg-[#F4F7FB] px-4 py-6 text-[#1B2A41] sm:px-6 lg:px-8 lg:py-10"><div className="mx-auto max-w-7xl">
    <header className="mb-7 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#3F6FAF]">NovelLib • Supabase</p><h1 className="mt-2 text-3xl font-bold">จัดการนิยาย</h1><p className="mt-1 text-sm text-slate-500">{role === 'AUTHOR' ? 'เขียนนิยายและจัดการผลงานของคุณ' : 'ตรวจสอบและดูแลเนื้อหาในระบบ'}</p></div><div className="flex flex-wrap gap-2"><Link href="/" className="rounded-xl bg-[#3F6FAF] px-4 py-2 text-white">📖 อ่านนิยาย</Link><button onClick={logout} className="rounded-xl border bg-white px-4 py-2">ออกจากระบบ</button></div></header>
    {notice.text && <div className={`mb-4 rounded-xl border p-3 text-sm ${notice.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{notice.text}</div>}
    <div className={`grid items-start gap-6 ${(role === 'AUTHOR' || editingId) ? 'xl:grid-cols-[380px_minmax(0,1fr)]' : ''}`}>
      {(role === 'AUTHOR' || editingId) && <form onSubmit={submit} className="h-fit rounded-3xl border bg-white p-5 shadow-sm sm:p-6 xl:sticky xl:top-6"><div className="mb-4 flex justify-between"><h2 className="font-bold">{editingId ? 'แก้ไขนิยายเพื่อดูแลเนื้อหา' : 'เพิ่มนิยายใหม่'}</h2>{editingId && <button type="button" onClick={reset} className="text-sm text-slate-500">ยกเลิก</button>}</div><div className="space-y-3">
        {[['title','ชื่อเรื่อง *'],['author','ผู้แต่ง *'],['genre','ประเภท *']].map(([key,label]) => <input key={key} className="w-full rounded-xl border px-3 py-2.5" placeholder={label} value={form[key]} onChange={(e) => update(key,e.target.value)} required />)}
        <textarea className="w-full rounded-xl border px-3 py-2.5" rows="3" placeholder="เรื่องย่อ *" value={form.description} onChange={(e) => update('description',e.target.value)} required /><textarea className="w-full rounded-xl border px-3 py-2.5" rows="7" placeholder="เนื้อหานิยาย" value={form.content} onChange={(e) => update('content',e.target.value)} />
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm text-[#3F6FAF]">
          <span className="font-semibold">คะแนนจากผู้อ่าน</span>
          <span className="mt-0.5 block text-xs text-slate-500">ระบบจะคำนวณคะแนนให้อัตโนมัติ นักเขียนไม่ต้องกำหนดคะแนนเอง</span>
        </div>
        <label className="block cursor-pointer rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 p-4 text-center text-sm font-semibold text-[#3F6FAF]">เลือกรูปปก JPG, PNG หรือ WebP (ไม่เกิน 10 MB)<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={chooseFile} /></label>
        {preview && <div className="relative mx-auto aspect-[2/3] w-28 overflow-hidden rounded-xl bg-slate-100"><Image src={preview} alt="ตัวอย่างรูปปก" fill unoptimized className="object-cover" /></div>}
        <button disabled={saving} className="w-full rounded-xl bg-[#3F6FAF] py-3 font-bold text-white disabled:opacity-60">{saving ? 'กำลังบันทึก...' : editingId ? 'บันทึกการแก้ไข' : 'เพิ่มนิยาย'}</button>
      </div></form>}
      <section className="min-w-0 rounded-3xl border bg-white p-5 shadow-sm sm:p-6"><div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h2 className="font-bold">{role === 'AUTHOR' ? 'ผลงานของฉัน' : 'รายการนิยาย'}</h2><p className="text-sm text-slate-500">ทั้งหมด {filtered.length} เรื่อง</p></div><input aria-label="ค้นหารายการนิยาย" className="w-full rounded-xl border px-3 py-2 text-sm sm:max-w-xs" placeholder="ค้นหาชื่อ ผู้แต่ง ประเภท" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
        {loading ? <p className="rounded-xl border border-dashed p-5 text-slate-500">กำลังโหลดจาก Supabase...</p> : !filtered.length ? <div className="rounded-xl border border-dashed p-6 text-center text-slate-500"><p className="font-semibold text-slate-700">ยังไม่มีนิยายในบัญชีนี้</p><p className="mt-1 text-sm">กรอกฟอร์มเพิ่มนิยายด้านซ้าย เมื่อบันทึกแล้วปุ่ม “จัดการตอน” จะแสดงที่รายการนิยาย</p></div> : <div className="space-y-3">{filtered.map((n) => <article key={n.id} className="flex gap-4 rounded-2xl border p-4"><div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-blue-200">{n.image && <Image src={n.image} alt={n.title} fill unoptimized className="object-cover" />}</div><div className="min-w-0 flex-1"><div className="flex justify-between"><h3 className="truncate font-bold">{n.title}</h3><span className="text-sm font-bold text-amber-500">★ {Number(n.rating).toFixed(1)}</span></div><p className="text-sm text-slate-500">{n.author} • {n.genre}</p><p className="mt-2 line-clamp-2 text-sm text-slate-600">{n.description}</p><div className="mt-3 flex flex-wrap gap-2">{role === 'AUTHOR' && <button type="button" onClick={() => manageChapters(n)} className="rounded-lg bg-[#3F6FAF] px-3 py-1.5 text-sm font-semibold text-white">＋ จัดการตอน</button>}<button type="button" onClick={() => edit(n)} className="rounded-lg border px-3 py-1.5 text-sm">แก้ไข</button><button type="button" onClick={() => remove(n)} className="rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white">ลบ</button></div></div></article>)}</div>}
      </section>
    </div>
    {role === 'AUTHOR' && <div id="chapter-manager" className="scroll-mt-6"><ChapterManager key={chapterNovelId || 'chapter-manager'} novels={novels.filter((novel) => novel.ownerId === userId)} role={role} selectedNovelId={chapterNovelId} /></div>}
    {role === 'ADMIN' && <nav className="mt-6 grid gap-3 sm:grid-cols-2"><a href="#author-applications" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-[#1B2A41] no-underline transition hover:-translate-y-0.5 hover:shadow"><span className="text-2xl">✍️</span><span className="ml-3 font-bold">คำขอสมัครนักเขียน</span><span className="mt-1 block text-sm text-slate-500">อนุมัติหรือปฏิเสธ Reader ที่ต้องการเป็น Author</span></a><a href="#user-permissions" className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-[#1B2A41] no-underline transition hover:-translate-y-0.5 hover:shadow"><span className="text-2xl">👥</span><span className="ml-3 font-bold">ผู้ใช้งานและสิทธิ์</span><span className="mt-1 block text-sm text-slate-500">ดูบัญชี แก้ไขข้อมูล และกำหนด Role</span></a></nav>}
    {role === 'ADMIN' && <div id="author-applications" className="scroll-mt-6"><AuthorApplicationManager /></div>}
    {role === 'ADMIN' && <div id="user-permissions" className="scroll-mt-6"><UserManager /></div>}
    {role === 'ADMIN' && <ModerationManager key={novels.map((novel) => novel.id).join(',')} novels={novels} />}
  </div></main>;
}
