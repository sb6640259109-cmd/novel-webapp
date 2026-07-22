'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios-client';

function Toggle({ checked, onChange, label, disabled = false }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={() => onChange(!checked)} className={`relative h-11 w-14 shrink-0 rounded-full transition-colors disabled:opacity-40 ${checked ? 'bg-[#10BFA5]' : 'bg-slate-300'}`}><span className={`absolute top-2.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`} /></button>;
}

function SettingRow({ title, description, value, children, onClick, muted = false }) {
  const content = <><div className="min-w-0 flex-1"><p className={`font-medium ${muted ? 'text-slate-300' : 'text-[#1B2A41]'}`}>{title}</p>{description && <p className="mt-1 text-xs leading-relaxed text-slate-400">{description}</p>}</div><div className="ml-auto flex shrink-0 items-center gap-3">{value && <span className="text-sm text-slate-400">{value}</span>}{children}{onClick && <span className="text-xl text-slate-400">›</span>}</div></>;
  return onClick ? <button type="button" onClick={onClick} className="flex min-h-16 w-full items-center gap-3 border-b px-4 py-3 text-left last:border-b-0 hover:bg-slate-50">{content}</button> : <div className="flex min-h-16 items-center gap-3 border-b px-4 py-3 last:border-b-0">{content}</div>;
}

const defaults = {
  hideAiWorks: false,
  showAiCharacters: true,
  notifications: true,
  adultConfirmed: false,
  appPasscode: false,
  allowIconChange: false,
};

export default function SettingsPanel({ open, onClose, currentUser, readerTheme, onReaderThemeChange }) {
  const [preferences, setPreferences] = useState(defaults);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      setPreferences(Object.fromEntries(Object.entries(defaults).map(([key, fallback]) => {
        const stored = window.localStorage.getItem(`setting:${key}`);
        return [key, stored === null ? fallback : stored === 'true'];
      })));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  const setPreference = (key) => (value) => {
    setPreferences((old) => ({ ...old, [key]: value }));
    window.localStorage.setItem(`setting:${key}`, String(value));
  };
  const restoreSettings = () => {
    Object.keys(defaults).forEach((key) => window.localStorage.removeItem(`setting:${key}`));
    window.localStorage.removeItem('readerTheme');
    window.localStorage.removeItem('readerFontSize');
    setPreferences(defaults);
    onReaderThemeChange('light');
  };
  const logout = async () => {
    try { await api.post('/auth/logout'); } finally { window.location.href = '/login'; }
  };

  if (!open) return null;
  return <div className="fixed inset-0 z-[500] flex justify-end bg-black/40" onClick={onClose}>
    <section role="dialog" aria-modal="true" aria-label="ตั้งค่า" onClick={(event) => event.stopPropagation()} className="h-full w-full overflow-y-auto bg-[#F8FAFC] shadow-2xl sm:max-w-[480px]">
      <header className="sticky top-0 z-10 flex items-center border-b bg-white/95 px-5 py-4 backdrop-blur">
        <button type="button" onClick={onClose} aria-label="ปิดหน้าตั้งค่า" className="grid h-10 w-10 place-items-center rounded-full text-3xl hover:bg-slate-100">×</button>
        <h2 className="flex-1 pr-10 text-center text-xl font-bold">ตั้งค่า</h2>
      </header>

      <div className="space-y-5 p-4 sm:p-6">
        <section className="overflow-hidden rounded-2xl border bg-white">
          <h3 className="border-b px-4 py-3 font-bold">ทั่วไป</h3>
          <SettingRow title="ซ่อน/แสดง ผลงานที่ใช้ปก AI" value={preferences.hideAiWorks ? 'ซ่อน' : 'แสดง'}><Toggle label="ซ่อนผลงานที่ใช้ปก AI" checked={preferences.hideAiWorks} onChange={setPreference('hideAiWorks')} /></SettingRow>
          <SettingRow title="ซ่อน/แสดง ตัวละครที่ใช้ภาพ AI" value={preferences.showAiCharacters ? 'แสดง' : 'ซ่อน'}><Toggle label="แสดงตัวละครที่ใช้ภาพ AI" checked={preferences.showAiCharacters} onChange={setPreference('showAiCharacters')} /></SettingRow>
          <SettingRow title="การแจ้งเตือน" value={preferences.notifications ? 'เปิด' : 'ปิด'}><Toggle label="การแจ้งเตือน" checked={preferences.notifications} onChange={setPreference('notifications')} /></SettingRow>
          <SettingRow title="ฉันยอมรับว่ามีอายุ มากกว่า 18 ปี" value={preferences.adultConfirmed ? 'ใช่' : 'ไม่'}><Toggle label="ยืนยันอายุมากกว่า 18 ปี" checked={preferences.adultConfirmed} onChange={setPreference('adultConfirmed')} /></SettingRow>
          <SettingRow
            title="โหมดกลางคืน"
            description={readerTheme === 'dark' ? 'เปิดสวิตช์: แสดงผลโหมดกลางคืน' : 'ปิดสวิตช์: แสดงผลโหมดกลางวัน'}
            value={readerTheme === 'dark' ? 'เปิด' : 'ปิด'}
          >
            <Toggle
              label="เปิดหรือปิดโหมดกลางคืน"
              checked={readerTheme === 'dark'}
              onChange={(enabled) => onReaderThemeChange(enabled ? 'dark' : 'light')}
            />
          </SettingRow>
          <SettingRow title="เรียกคืนการตั้งค่า" description="คืนค่าการตั้งค่าทั้งหมดเป็นค่าเริ่มต้น" onClick={restoreSettings} />
        </section>

        <section className="overflow-hidden rounded-2xl border bg-white">
          <h3 className="border-b px-4 py-3 font-bold">ความเป็นส่วนตัว</h3>
          <SettingRow title="เปิดใช้รหัสผ่านสำหรับแอปพลิเคชัน" value={preferences.appPasscode ? 'เปิด' : 'ปิด'}><Toggle label="รหัสผ่านสำหรับแอปพลิเคชัน" checked={preferences.appPasscode} onChange={setPreference('appPasscode')} /></SettingRow>
          <SettingRow title="ยินยอมให้เปลี่ยนไอคอนแอปพลิเคชัน" value={preferences.allowIconChange ? 'ยินยอม' : 'ไม่ยินยอม'}><Toggle label="เปลี่ยนไอคอนแอปพลิเคชัน" checked={preferences.allowIconChange} onChange={setPreference('allowIconChange')} /></SettingRow>
          <SettingRow title="การแสดงผลแฟนบอร์ด" value="ปิด" muted><Toggle label="การแสดงผลแฟนบอร์ด" checked={false} onChange={() => {}} disabled /></SettingRow>
          <SettingRow title="การจัดการข้อมูลส่วนบุคคล" description="โปรไฟล์และข้อมูลบัญชี" onClick={() => { window.location.href = currentUser ? '/profile' : '/login'; }} />
        </section>

        <section className="overflow-hidden rounded-2xl border bg-white">
          <h3 className="border-b px-4 py-3 font-bold">บัญชีผู้ใช้</h3>
          {currentUser ? <><SettingRow title={currentUser.username} description={`สิทธิ์ ${currentUser.role}`} onClick={() => { window.location.href = '/profile'; }} />{currentUser.role === 'READER' && <SettingRow title="สมัครเป็นนักเขียน" description="ส่งคำขอเพื่อเปิดสิทธิ์จัดการนิยาย" onClick={() => { window.location.href = '/author-apply'; }} />}<button type="button" onClick={logout} className="w-full px-4 py-4 text-center font-bold text-red-500 hover:bg-red-50">ออกจากระบบ</button></> : <div className="space-y-2 p-4"><a href="/login" className="block rounded-xl bg-[#3F6FAF] px-4 py-3 text-center font-bold text-white no-underline">เข้าสู่ระบบ</a><a href="/register" className="block rounded-xl border px-4 py-3 text-center font-semibold text-[#3F6FAF] no-underline">สมัครสมาชิก</a></div>}
        </section>
      </div>
    </section>
  </div>;
}
