"use client";
import React, { useEffect, useState } from 'react';
import api from '@/lib/axios-client';
import { useRouter } from 'next/navigation';

export default function AdminPanel() {
  const router = useRouter();
  const [novels, setNovels] = useState([]);
  const [form, setForm] = useState({ title: '', author: '', genre: '', description: '', rating: 0, image: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNovels = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/novels');
      setNovels(response.data.novels || []);
    } catch (err) {
      setError('ไม่สามารถโหลดรายการนิยายได้ในขณะนี้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNovels();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      if (editingId) {
        await api.put(`/novels/${editingId}`, form);
        setMessage('แก้ไขนิยายสำเร็จ');
      } else {
        await api.post('/novels', form);
        setMessage('เพิ่มนิยายสำเร็จ');
      }

      setForm({ title: '', author: '', genre: '', description: '', rating: 0, image: '' });
      setEditingId(null);
      loadNovels();
    } catch (err) {
      setError('บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleEdit = (novel) => {
    setEditingId(novel.id);
    setForm({
      title: novel.title,
      author: novel.author,
      genre: novel.genre,
      description: novel.description,
      rating: novel.rating,
      image: novel.image || '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ยืนยันการลบนิยายนี้?')) return;
    try {
      await api.delete(`/novels/${id}`);
      setMessage('ลบนิยายสำเร็จ');
      loadNovels();
    } catch (err) {
      setError('ลบนิยายไม่สำเร็จ');
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4FA] p-6 text-[#111827]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">จัดการนิยาย</h1>
            <p className="text-sm text-[#4B5563]">เพิ่ม แก้ไข และลบรายการนิยายจากระบบ</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/" className="rounded-lg bg-[#2B5EAB] px-4 py-2 text-white no-underline">กลับหน้าหลัก</a>
            <button onClick={handleLogout} className="rounded-lg border border-[#E2E8F2] bg-white px-4 py-2 text-[#111827]">ออกจากระบบ</button>
          </div>
        </div>

        {message && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>}
        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">{editingId ? 'แก้ไขนิยาย' : 'เพิ่มนิยายใหม่'}</h2>
            <div className="space-y-3">
              <input className="w-full rounded-lg border px-3 py-2" placeholder="ชื่อเรื่อง" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <input className="w-full rounded-lg border px-3 py-2" placeholder="ชื่อผู้แต่ง" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} required />
              <input className="w-full rounded-lg border px-3 py-2" placeholder="ประเภท" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} required />
              <textarea className="w-full rounded-lg border px-3 py-2" placeholder="เรื่องย่อ" rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              <input className="w-full rounded-lg border px-3 py-2" type="number" step="0.1" placeholder="เรตติ้ง" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} />
              <input className="w-full rounded-lg border px-3 py-2" placeholder="ลิงก์รูปภาพ" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
              <button type="submit" className="w-full rounded-lg bg-[#2B5EAB] px-4 py-2.5 font-semibold text-white">{editingId ? 'บันทึกการแก้ไข' : 'เพิ่มนิยาย'}</button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm({ title: '', author: '', genre: '', description: '', rating: 0, image: '' });
                  }}
                  className="w-full rounded-lg border border-[#E2E8F2] px-4 py-2 text-sm text-[#4B5563]"
                >
                  ยกเลิกแก้ไข
                </button>
              )}
            </div>
          </form>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">รายการนิยาย</h2>
            <div className="space-y-3">
              {loading ? (
                <div className="rounded-lg border border-dashed border-[#E2E8F2] p-4 text-sm text-[#4B5563]">กำลังโหลดรายการนิยาย...</div>
              ) : novels.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[#E2E8F2] p-4 text-sm text-[#4B5563]">ยังไม่มีข้อมูลนิยายในระบบ</div>
              ) : (
                novels.map((novel) => (
                  <div key={novel.id} className="rounded-xl border border-[#E2E8F2] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{novel.title}</h3>
                        <p className="text-sm text-[#4B5563]">{novel.author} • {novel.genre}</p>
                        <p className="mt-1 text-sm text-[#6B7280]">{novel.description}</p>
                      </div>
                      <div className="text-sm font-semibold text-[#F59E0B]">★ {novel.rating}</div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => handleEdit(novel)} className="rounded-lg border border-[#E2E8F2] px-3 py-1.5 text-sm">แก้ไข</button>
                      <button onClick={() => handleDelete(novel.id)} className="rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white">ลบ</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
