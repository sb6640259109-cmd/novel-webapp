'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios-client';

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  useEffect(() => {
    api.get('/admin/users').then((response) => setUsers(response.data.users || []))
      .catch((requestError) => setError(requestError.response?.data?.message || 'โหลดผู้ใช้งานไม่สำเร็จ'));
  }, []);

  const changeRole = async (userId, role) => {
    try {
      const response = await api.put('/admin/users', { userId, role });
      setUsers((old) => old.map((user) => user.id === userId ? response.data.user : user));
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'อัปเดตสิทธิ์ไม่สำเร็จ');
    }
  };

  const addAuthor = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post('/admin/users', form);
      setUsers((old) => [response.data.user, ...old]);
      setForm({ username: '', email: '', password: '' });
      setError('');
    } catch (requestError) { setError(requestError.response?.data?.message || 'เพิ่มนักเขียนไม่สำเร็จ'); }
  };

  const editUser = async (user) => {
    const username = window.prompt('ชื่อผู้ใช้ใหม่', user.username);
    if (!username) return;
    try {
      const response = await api.put('/admin/users', { userId: user.id, role: user.role === 'USER' ? 'READER' : user.role, username });
      setUsers((old) => old.map((item) => item.id === user.id ? response.data.user : item));
    } catch (requestError) { setError(requestError.response?.data?.message || 'แก้ไขนักเขียนไม่สำเร็จ'); }
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`ลบบัญชี ${user.email} ใช่หรือไม่?`)) return;
    try {
      await api.delete(`/admin/users?userId=${user.id}`);
      setUsers((old) => old.filter((item) => item.id !== user.id));
    } catch (requestError) { setError(requestError.response?.data?.message || 'ลบนักเขียนไม่สำเร็จ'); }
  };

  return <section className="mt-6 rounded-3xl border bg-white p-6 shadow-sm">
    <div className="mb-5"><h2 className="text-xl font-bold">จัดการผู้ใช้งานและสิทธิ์</h2><p className="text-sm text-slate-500">กำหนด Reader, Author หรือ Admin</p></div>
    {error && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <form onSubmit={addAuthor} className="mb-5 grid gap-3 rounded-2xl border bg-slate-50 p-4 md:grid-cols-[1fr_1fr_1fr_auto]"><input value={form.username} onChange={(event) => setForm((old) => ({ ...old, username: event.target.value }))} placeholder="ชื่อผู้ใช้นักเขียน" required className="rounded-lg border px-3 py-2" /><input type="email" value={form.email} onChange={(event) => setForm((old) => ({ ...old, email: event.target.value }))} placeholder="อีเมล" required className="rounded-lg border px-3 py-2" /><input type="password" minLength={8} value={form.password} onChange={(event) => setForm((old) => ({ ...old, password: event.target.value }))} placeholder="รหัสผ่านอย่างน้อย 8 ตัว" required className="rounded-lg border px-3 py-2" /><button className="rounded-lg bg-[#3F6FAF] px-4 py-2 font-semibold text-white">เพิ่มนักเขียน</button></form>
    <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b text-slate-500"><th className="p-3">ผู้ใช้งาน</th><th className="p-3">อีเมล</th><th className="p-3">วันที่สมัคร</th><th className="p-3">สิทธิ์</th><th className="p-3">จัดการ</th></tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-b last:border-0"><td className="p-3 font-semibold">{user.displayName || user.username}</td><td className="p-3 text-slate-600">{user.email}</td><td className="p-3 text-slate-500">{new Date(user.createdAt).toLocaleDateString('th-TH')}</td><td className="p-3"><select value={user.role === 'USER' ? 'READER' : user.role} onChange={(event) => changeRole(user.id, event.target.value)} className="rounded-lg border px-3 py-2"><option value="READER">Reader</option><option value="AUTHOR">Author</option><option value="ADMIN">Admin</option></select></td><td className="p-3"><div className="flex gap-2"><button type="button" onClick={() => editUser(user)} className="rounded-lg border px-3 py-2">แก้ไข</button>{user.role === 'AUTHOR' && <button type="button" onClick={() => deleteUser(user)} className="rounded-lg bg-red-500 px-3 py-2 text-white">ลบ</button>}</div></td></tr>)}</tbody></table></div>
  </section>;
}
