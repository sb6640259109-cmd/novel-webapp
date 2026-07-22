'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios-client';

const blank = { title: '', content: '' };

export default function ChapterManager({ novels, role, selectedNovelId = '' }) {
  const [novelId, setNovelId] = useState(String(selectedNovelId || ''));
  const [chapters, setChapters] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!novelId) return;
    api.get(`/novels/${novelId}/chapters`)
      .then((response) => setChapters(response.data.chapters || []))
      .catch((error) => setNotice({ type: 'error', text: error.response?.data?.message || 'โหลดตอนนิยายไม่สำเร็จ' }));
  }, [novelId]);

  const reset = () => {
    setForm(blank);
    setEditingId(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!novelId) return;
    setSaving(true);
    setNotice({ type: '', text: '' });
    try {
      const response = editingId
        ? await api.put(`/novels/${novelId}/chapters/${editingId}`, form)
        : await api.post(`/novels/${novelId}/chapters`, form);
      if (editingId) {
        setChapters((old) => old.map((chapter) => chapter.id === editingId ? response.data.chapter : chapter));
      } else {
        setChapters((old) => [...old, response.data.chapter]);
      }
      reset();
      setNotice({ type: 'success', text: editingId ? 'แก้ไขตอนเรียบร้อยแล้ว' : 'เพิ่มตอนเรียบร้อยแล้ว' });
    } catch (error) {
      setNotice({ type: 'error', text: error.response?.data?.message || 'บันทึกตอนไม่สำเร็จ' });
    } finally {
      setSaving(false);
    }
  };

  const move = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= chapters.length) return;
    const reordered = [...chapters];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    try {
      const response = await api.put(`/novels/${novelId}/chapters`, { chapterIds: reordered.map((chapter) => chapter.id) });
      setChapters(response.data.chapters);
    } catch (error) {
      setNotice({ type: 'error', text: error.response?.data?.message || 'เรียงลำดับตอนไม่สำเร็จ' });
    }
  };

  const remove = async (chapter) => {
    if (!window.confirm(`ลบตอน “${chapter.title}” ใช่หรือไม่?`)) return;
    try {
      await api.delete(`/novels/${novelId}/chapters/${chapter.id}`);
      setChapters((old) => old.filter((item) => item.id !== chapter.id)
        .map((item, index) => ({ ...item, order: index + 1 })));
      if (editingId === chapter.id) reset();
    } catch (error) {
      setNotice({ type: 'error', text: error.response?.data?.message || 'ลบตอนไม่สำเร็จ' });
    }
  };

  return (
    <section className="mt-6 rounded-3xl border bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold">จัดการตอนนิยาย</h2>
        <p className="text-sm text-slate-500">เพิ่ม แก้ไข และเรียงลำดับตอน{role === 'ADMIN' ? ' รวมถึงลบตอน' : ''}</p>
      </div>
      <select value={novelId} onChange={(event) => { setNovelId(event.target.value); setChapters([]); reset(); }} className="mb-5 w-full rounded-xl border px-3 py-2.5">
        <option value="">เลือกนิยายที่ต้องการจัดการตอน</option>
        {novels.map((novel) => <option key={novel.id} value={novel.id}>{novel.title}</option>)}
      </select>
      {notice.text && <div className={`mb-4 rounded-xl border p-3 text-sm ${notice.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{notice.text}</div>}
      {novelId && <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <form onSubmit={submit} className="h-fit rounded-2xl border bg-slate-50 p-5">
          <div className="mb-3 flex justify-between"><h3 className="font-bold">{editingId ? 'แก้ไขตอน' : 'เพิ่มตอนใหม่'}</h3>{editingId && <button type="button" onClick={reset} className="text-sm text-slate-500">ยกเลิก</button>}</div>
          <input value={form.title} onChange={(event) => setForm((old) => ({ ...old, title: event.target.value }))} placeholder="ชื่อตอน *" required className="mb-3 w-full rounded-xl border px-3 py-2.5" />
          <textarea value={form.content} onChange={(event) => setForm((old) => ({ ...old, content: event.target.value }))} placeholder="เนื้อหาตอน *" required rows={10} className="mb-3 w-full rounded-xl border px-3 py-2.5" />
          <button disabled={saving} className="w-full rounded-xl bg-[#3F6FAF] py-3 font-bold text-white disabled:opacity-60">{saving ? 'กำลังบันทึก...' : editingId ? 'บันทึกการแก้ไข' : 'เพิ่มตอน'}</button>
        </form>
        <div className="space-y-3">
          {!chapters.length && <p className="rounded-xl border border-dashed p-5 text-slate-500">นิยายเรื่องนี้ยังไม่มีตอน</p>}
          {chapters.map((chapter, index) => <article key={chapter.id} className="rounded-2xl border p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="text-xs font-bold text-[#3F6FAF]">ตอนที่ {index + 1}</p><h3 className="font-bold">{chapter.title}</h3></div>
              <div className="flex gap-2">
                <button type="button" disabled={index === 0} onClick={() => move(index, -1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-30">↑</button>
                <button type="button" disabled={index === chapters.length - 1} onClick={() => move(index, 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-30">↓</button>
                <button type="button" onClick={() => { setEditingId(chapter.id); setForm({ title: chapter.title, content: chapter.content }); }} className="rounded-lg border px-3 py-1.5">แก้ไข</button>
                <button type="button" onClick={() => remove(chapter)} className="rounded-lg bg-red-500 px-3 py-1.5 text-white">ลบ</button>
              </div>
            </div>
            <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-sm text-slate-600">{chapter.content}</p>
          </article>)}
        </div>
      </div>}
    </section>
  );
}
