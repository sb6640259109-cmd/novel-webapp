'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios-client';

const emptyForm = { fullName: '', birthDate: '', phone: '', country: 'ประเทศไทย', penName: '', introduction: '', genres: '', sampleWork: '', accepted: false };

export default function AuthorApplyPage() {
  const [user, setUser] = useState(null), [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ type: '', text: '' });
  const [form, setForm] = useState(emptyForm);
  const update = (field, value) => setForm((old) => ({ ...old, [field]: value }));

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const session = await api.get('/auth/session');
        if (!session.data.authenticated || !session.data.user) {
          window.location.replace('/login');
          return;
        }
        if (!active) return;
        setUser(session.data.user);
        try {
          const result = await api.get('/author-applications');
          if (active) setApplication(result.data.application);
        } catch (error) {
          if (active) setNotice({ type: 'error', text: error.response?.data?.message || 'ยังโหลดสถานะคำขอเดิมไม่ได้ แต่คุณสามารถกรอกแบบฟอร์มได้' });
        }
      } catch {
        window.location.replace('/login');
        return;
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);
  const submit = async (event) => { event.preventDefault(); if (!form.accepted) return setNotice({ type: 'error', text: 'กรุณาอ่านและยอมรับกฎการเป็นนักเขียนก่อนส่งคำขอ' }); setSaving(true); setNotice({ type: '', text: '' }); try { const response = await api.post('/author-applications', form); setApplication(response.data.application); setNotice({ type: 'success', text: response.data.message }); } catch (error) { setNotice({ type: 'error', text: error.response?.data?.message || 'ส่งคำขอไม่สำเร็จ' }); } finally { setSaving(false); } };
  if (loading) return <div className="grid min-h-screen place-items-center bg-[#F4F7FB]">กำลังโหลด...</div>;
  const statusText = { PENDING: 'อยู่ระหว่างการตรวจสอบ', APPROVED: 'อนุมัติแล้ว', REJECTED: 'ไม่ผ่านการอนุมัติ' };
  const inputClass = 'mt-2 w-full rounded-xl border border-[#CBD8E7] bg-white px-3.5 py-3 outline-none transition focus:border-[#3F6FAF] focus:ring-4 focus:ring-[#3F6FAF]/10';

  return <main className="min-h-screen bg-[#EEF3F9] px-4 py-6 text-[#1B2A41] sm:px-6 lg:py-10"><div className="mx-auto max-w-5xl">
    <header className="mb-7 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#3F6FAF]">NovelLib Author</p><h1 className="mt-2 text-3xl font-bold sm:text-4xl">เริ่มต้นเส้นทางนักเขียน</h1><p className="mt-2 text-[#64748B]">กรอกข้อมูลให้ครบเพื่อให้ทีมงานตรวจสอบคำขอของคุณ</p></div><Link href="/" className="rounded-xl border border-[#CBD8E7] bg-white px-4 py-2.5 font-semibold no-underline">← กลับหน้าหลัก</Link></header>
    {notice.text && <p role="alert" className={`mb-4 rounded-xl border p-3 ${notice.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{notice.text}</p>}
    {user?.role === 'AUTHOR' || application?.status === 'APPROVED' ? <div className="rounded-3xl border bg-white p-8 text-center shadow-sm"><p className="text-5xl">✍️</p><h2 className="mt-4 text-2xl font-bold">คุณเป็นนักเขียนแล้ว</h2><p className="mt-2 text-slate-500">ออกจากระบบและเข้าสู่ระบบใหม่หากสิทธิ์ยังไม่อัปเดต</p><a href="/admin" className="mt-5 inline-block rounded-xl bg-[#3F6FAF] px-5 py-3 font-bold text-white no-underline">ไปหน้าจัดการนิยาย</a></div> : application?.status === 'PENDING' ? <div className="rounded-3xl border bg-white p-8 text-center shadow-sm"><p className="text-5xl">⏳</p><h2 className="mt-4 text-2xl font-bold">{statusText.PENDING}</h2><p className="mt-2 text-slate-500">นามปากกา: {application.penName}</p><p className="mt-1 text-sm text-slate-400">ทีมงานจะแจ้งผลเมื่ออนุมัติหรือปฏิเสธคำขอ</p></div> :
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-6">
        {application?.status === 'REJECTED' && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700"><b>{statusText.REJECTED}</b><p className="mt-1 text-sm">เหตุผล: {application.rejectionReason}</p><p className="mt-1 text-sm">แก้ไขข้อมูลแล้วส่งคำขอใหม่ได้</p></div>}
        <section className="rounded-3xl border border-[#D7E1ED] bg-white p-5 shadow-sm sm:p-7"><div className="mb-5 flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#E8F0FA] font-bold text-[#3F6FAF]">1</span><div><h2 className="text-xl font-bold">ข้อมูลยืนยันตัวตน</h2><p className="mt-1 text-sm text-[#64748B]">ใช้ตรวจสอบคำขอเท่านั้น ไม่แสดงต่อผู้อ่าน</p></div></div><div className="grid gap-4 sm:grid-cols-2"><label className="font-semibold sm:col-span-2">ชื่อ–นามสกุลจริง *<input required minLength={4} maxLength={150} autoComplete="name" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} className={inputClass} /></label><label className="font-semibold">วันเกิด *<input required type="date" autoComplete="bday" max={new Date().toISOString().slice(0, 10)} value={form.birthDate} onChange={(e) => update('birthDate', e.target.value)} className={inputClass} /></label><label className="font-semibold">เบอร์โทรศัพท์ *<input required type="tel" minLength={8} maxLength={20} autoComplete="tel" placeholder="เช่น 0812345678" value={form.phone} onChange={(e) => update('phone', e.target.value)} className={inputClass} /></label><label className="font-semibold sm:col-span-2">ประเทศ/ภูมิภาค *<input required maxLength={100} autoComplete="country-name" value={form.country} onChange={(e) => update('country', e.target.value)} className={inputClass} /></label></div></section>
        <section className="rounded-3xl border border-[#D7E1ED] bg-white p-5 shadow-sm sm:p-7"><div className="mb-5 flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#E8F0FA] font-bold text-[#3F6FAF]">2</span><div><h2 className="text-xl font-bold">ข้อมูลนักเขียน</h2><p className="mt-1 text-sm text-[#64748B]">ข้อมูลส่วนนี้ใช้ประกอบการพิจารณาและนามปากกาจะปรากฏต่อผู้อ่าน</p></div></div><div className="space-y-4"><label className="block font-semibold">นามปากกา *<input required minLength={2} maxLength={100} value={form.penName} onChange={(e) => update('penName', e.target.value)} className={inputClass} /></label><label className="block font-semibold">แนะนำตัวและเหตุผลที่อยากเป็นนักเขียน *<textarea required minLength={20} maxLength={1000} rows={5} value={form.introduction} onChange={(e) => update('introduction', e.target.value)} className={inputClass} /></label><label className="block font-semibold">ประเภทนิยายที่สนใจ *<input required maxLength={200} placeholder="เช่น แฟนตาซี, โรแมนติก" value={form.genres} onChange={(e) => update('genres', e.target.value)} className={inputClass} /></label><label className="block font-semibold">ตัวอย่างผลงาน (ถ้ามี)<textarea maxLength={2000} rows={6} value={form.sampleWork} onChange={(e) => update('sampleWork', e.target.value)} className={inputClass} /></label></div></section>
      </div>
      <aside className="h-fit rounded-3xl bg-[#203A5F] p-5 text-white shadow-[0_18px_45px_rgba(32,58,95,.22)] lg:sticky lg:top-6"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#AFC8E8]">ก่อนส่งคำขอ</p><h2 className="mt-2 text-xl font-bold">กฎสำคัญสำหรับนักเขียน</h2><ul className="mt-4 space-y-3 text-sm leading-6 text-white/80"><li>• เผยแพร่เฉพาะผลงานที่มีสิทธิใช้งาน</li><li>• ไม่คัดลอกหรือละเมิดลิขสิทธิ์</li><li>• ไม่เผยแพร่เนื้อหาผิดกฎหมายหรือสร้างความเกลียดชัง</li><li>• ระบุคำเตือนเนื้อหาและหมวดหมู่ตามจริง</li><li>• รับผิดชอบต่อข้อมูลและผลงานของตน</li></ul><Link href="/author-rules" target="_blank" className="mt-4 inline-block text-sm font-bold text-white underline underline-offset-4">อ่านกฎฉบับเต็ม ↗</Link><label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl bg-white/10 p-4 text-sm leading-6"><input type="checkbox" checked={form.accepted} onChange={(e) => update('accepted', e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-white" /><span>ฉันยืนยันว่าข้อมูลเป็นความจริง ผลงานเป็นของตนเอง และยอมรับกฎการเป็นนักเขียนทั้งหมด</span></label><p className="mt-3 text-xs leading-5 text-white/55">ข้อมูลยืนยันตัวตนเข้าถึงได้เฉพาะผู้ดูแลที่ตรวจคำขอ</p><button disabled={saving || !form.accepted} className="mt-5 w-full rounded-xl bg-white py-3 font-bold text-[#203A5F] transition hover:bg-[#E8F0FA] disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'กำลังส่ง...' : 'ส่งคำขอสมัครนักเขียน'}</button></aside>
    </form>}
  </div></main>;
}
