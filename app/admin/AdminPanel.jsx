'use client';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios-client';
import ChapterManager from './ChapterManager';
import UserManager from './UserManager';
import ModerationManager from './ModerationManager';

const blank = { title: '', author: '', genre: '', description: '', content: '', rating: 0, image: '' };

export default function AdminPanel({ role, userId }) {
  const router = useRouter();
  const [novels, setNovels] = useState([]), [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null), [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ type: '', text: '' });
  const [file, setFile] = useState(null), [preview, setPreview] = useState('');

  const load = async () => {
    setLoading(true);
    try { setNovels((await api.get('/novels')).data.novels || []); }
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
      setNotice({ type: 'success', text: editingId ? 'แก้ไขนิยายใน Firestore แล้ว' : 'เพิ่มนิยายใน Firestore แล้ว' });
      reset(); await load();
    } catch (error) { setNotice({ type: 'error', text: error.response?.data?.message || 'บันทึกข้อมูลไม่สำเร็จ' }); }
    finally { setSaving(false); }
  };

  const edit = (n) => {
    setEditingId(n.id); setForm({ title: n.title, author: n.author, genre: n.genre, description: n.description, content: n.content || '', rating: n.rating, image: n.image || '' });
    setFile(null); setPreview(n.image || ''); window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const remove = async (n) => {
    if (!confirm(`ลบนิยาย “${n.title}” ใช่หรือไม่?`)) return;
    try { await api.delete(`/novels/${n.id}`); setNotice({ type: 'success', text: 'ลบนิยายแล้ว' }); await load(); }
    catch (e) { setNotice({ type: 'error', text: e.response?.data?.message || 'ลบนิยายไม่สำเร็จ' }); }
  };
  const logout = async () => { try { await api.post('/auth/logout'); } finally { router.push('/login'); } };

  return <main data-role={role} className="min-h-screen bg-[#F4F7FB] p-4 text-[#1B2A41] md:p-8"><div className="mx-auto max-w-7xl">
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#3F6FAF]">NovelLib • Cloud Firestore</p><h1 className="mt-2 text-3xl font-bold">จัดการนิยาย</h1><p className="text-sm text-slate-500">เพิ่ม แก้ไข ค้นหา และลบนิยายจาก Firebase</p></div><div className="flex gap-2"><Link href="/" className="rounded-xl bg-[#3F6FAF] px-4 py-2 text-white">หน้าหลัก</Link><button onClick={logout} className="rounded-xl border bg-white px-4 py-2">ออกจากระบบ</button></div></header>
    {notice.text && <div className={`mb-4 rounded-xl border p-3 text-sm ${notice.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{notice.text}</div>}
    <div className={`grid gap-6 ${(role === 'AUTHOR' || editingId) ? 'lg:grid-cols-[390px_1fr]' : ''}`}>
      {(role === 'AUTHOR' || editingId) && <form onSubmit={submit} className="h-fit rounded-3xl border bg-white p-6 shadow-sm lg:sticky lg:top-6"><div className="mb-4 flex justify-between"><h2 className="font-bold">{editingId ? 'แก้ไขนิยายเพื่อดูแลเนื้อหา' : 'เพิ่มนิยายใหม่'}</h2>{editingId && <button type="button" onClick={reset} className="text-sm text-slate-500">ยกเลิก</button>}</div><div className="space-y-3">
        {[['title','ชื่อเรื่อง *'],['author','ผู้แต่ง *'],['genre','ประเภท *']].map(([key,label]) => <input key={key} className="w-full rounded-xl border px-3 py-2.5" placeholder={label} value={form[key]} onChange={(e) => update(key,e.target.value)} required />)}
        <textarea className="w-full rounded-xl border px-3 py-2.5" rows="3" placeholder="เรื่องย่อ *" value={form.description} onChange={(e) => update('description',e.target.value)} required /><textarea className="w-full rounded-xl border px-3 py-2.5" rows="7" placeholder="เนื้อหานิยาย" value={form.content} onChange={(e) => update('content',e.target.value)} />
        <label className="block text-sm">คะแนน (0–5)<input className="mt-1 w-full rounded-xl border px-3 py-2.5" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e) => update('rating',e.target.value)} /></label>
        <label className="block cursor-pointer rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 p-4 text-center text-sm font-semibold text-[#3F6FAF]">เลือกรูปปก JPG, PNG หรือ WebP (ไม่เกิน 10 MB)<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={chooseFile} /></label>
        {preview && <div className="relative mx-auto aspect-[2/3] w-28 overflow-hidden rounded-xl bg-slate-100"><Image src={preview} alt="ตัวอย่างรูปปก" fill unoptimized className="object-cover" /></div>}
        <button disabled={saving} className="w-full rounded-xl bg-[#3F6FAF] py-3 font-bold text-white disabled:opacity-60">{saving ? 'กำลังบันทึก...' : editingId ? 'บันทึกการแก้ไข' : 'เพิ่มนิยาย'}</button>
      </div></form>}
      <section className="rounded-3xl border bg-white p-6 shadow-sm"><div className="mb-5 flex flex-wrap justify-between gap-3"><div><h2 className="font-bold">รายการนิยาย</h2><p className="text-sm text-slate-500">ทั้งหมด {novels.length} เรื่อง</p></div><input className="rounded-xl border px-3 py-2 text-sm" placeholder="ค้นหาชื่อ ผู้แต่ง ประเภท" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
        {loading ? <p className="rounded-xl border border-dashed p-5 text-slate-500">กำลังโหลดจาก Firestore...</p> : !filtered.length ? <p className="rounded-xl border border-dashed p-5 text-slate-500">ไม่พบรายการนิยาย</p> : <div className="space-y-3">{filtered.map((n) => <article key={n.id} className="flex gap-4 rounded-2xl border p-4"><div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-blue-200">{n.image && <Image src={n.image} alt={n.title} fill unoptimized className="object-cover" />}</div><div className="min-w-0 flex-1"><div className="flex justify-between"><h3 className="truncate font-bold">{n.title}</h3><span className="text-sm font-bold text-amber-500">★ {Number(n.rating).toFixed(1)}</span></div><p className="text-sm text-slate-500">{n.author} • {n.genre}</p><p className="mt-2 line-clamp-2 text-sm text-slate-600">{n.description}</p><div className="mt-3 flex gap-2"><button onClick={() => edit(n)} className="rounded-lg border px-3 py-1.5 text-sm">แก้ไข</button><button onClick={() => remove(n)} className="rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white">ลบ</button></div></div></article>)}</div>}
      </section>
    </div>
    {role === 'AUTHOR' && <ChapterManager novels={novels.filter((novel) => novel.ownerId === userId)} role={role} />}
    {role === 'ADMIN' && <UserManager />}
    {role === 'ADMIN' && <ModerationManager key={novels.map((novel) => novel.id).join(',')} novels={novels} />}
  </div></main>;
}
