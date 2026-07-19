'use client';

import { useState } from 'react';
import api from '@/lib/axios-client';

export default function ModerationManager({ novels }) {
  const [items, setItems] = useState(novels);
  const [notice, setNotice] = useState('');

  const update = (id, key, value) => setItems((old) => old.map((item) => item.id === id ? { ...item, [key]: value } : item));
  const save = async (novel) => {
    try {
      const response = await api.put(`/admin/novels/${novel.id}/moderation`, {
        moderationStatus: novel.moderationStatus || 'ACTIVE',
        copyrightStatus: novel.copyrightStatus || 'CLEAR',
        moderationReason: novel.moderationReason || '',
      });
      update(novel.id, 'updatedAt', response.data.novel.updatedAt);
      setNotice(`บันทึกการตรวจสอบ “${novel.title}” แล้ว`);
    } catch (error) {
      setNotice(error.response?.data?.message || 'บันทึกการตรวจสอบไม่สำเร็จ');
    }
  };

  return <section className="mt-6 rounded-3xl border bg-white p-6 shadow-sm">
    <div className="mb-5"><h2 className="text-xl font-bold">ตรวจสอบเนื้อหาและลิขสิทธิ์</h2><p className="text-sm text-slate-500">ระงับเนื้อหาลามกเกินไปหรือผลงานที่อาจคัดลอก/ละเมิดลิขสิทธิ์</p></div>
    {notice && <p className="mb-4 rounded-xl border bg-blue-50 p-3 text-sm text-blue-700">{notice}</p>}
    <div className="space-y-3">{items.map((novel) => <article key={novel.id} className="rounded-2xl border p-4"><div className="mb-3"><h3 className="font-bold">{novel.title}</h3><p className="text-sm text-slate-500">{novel.author} • เจ้าของ: {novel.ownerUsername || 'ข้อมูลเดิม/ไม่ระบุ'}</p></div><div className="grid gap-3 md:grid-cols-[180px_180px_1fr_auto]"><select value={novel.moderationStatus || 'ACTIVE'} onChange={(event) => update(novel.id, 'moderationStatus', event.target.value)} className="rounded-lg border px-3 py-2"><option value="ACTIVE">เผยแพร่ปกติ</option><option value="REVIEW">รอตรวจสอบ</option><option value="SUSPENDED">ระงับการเผยแพร่</option></select><select value={novel.copyrightStatus || 'CLEAR'} onChange={(event) => update(novel.id, 'copyrightStatus', event.target.value)} className="rounded-lg border px-3 py-2"><option value="CLEAR">ลิขสิทธิ์ปกติ</option><option value="REVIEW">ตรวจสอบลิขสิทธิ์</option><option value="VIOLATION">พบการละเมิด</option></select><input value={novel.moderationReason || ''} onChange={(event) => update(novel.id, 'moderationReason', event.target.value)} maxLength={1000} placeholder="เหตุผล/หลักฐาน เช่น เนื้อหาลามกหรือแหล่งที่คัดลอก" className="rounded-lg border px-3 py-2" /><button type="button" onClick={() => save(novel)} className="rounded-lg bg-[#3F6FAF] px-4 py-2 font-semibold text-white">บันทึก</button></div></article>)}</div>
  </section>;
}
