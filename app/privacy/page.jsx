import Link from 'next/link';

export const metadata = { title: 'นโยบายความเป็นส่วนตัว | NovelLib' };

export default function PrivacyPage() {
  return <main className="min-h-screen bg-[#F4F7FB] px-4 py-10 text-[#1B2A41] sm:px-6">
    <article className="mx-auto max-w-3xl rounded-3xl border border-[#DCE5F0] bg-white p-6 shadow-sm sm:p-10">
      <Link href="/register" className="text-sm font-semibold text-[#3F6FAF] hover:underline">← กลับหน้าสมัครสมาชิก</Link>
      <p className="mt-7 text-sm font-bold uppercase tracking-wider text-[#6F96C9]">NovelLib</p>
      <h1 className="mt-1 text-3xl font-bold">นโยบายความเป็นส่วนตัว</h1>
      <p className="mt-3 leading-7 text-[#64748B]">นโยบายนี้อธิบายข้อมูลที่ NovelLib ใช้เพื่อให้บริการแพลตฟอร์มอ่านนิยายฟรี</p>
      <div className="mt-8 space-y-7 leading-7 text-[#475569]">
        <section><h2 className="text-lg font-bold text-[#1B2A41]">ข้อมูลที่เราเก็บ</h2><p className="mt-2">ข้อมูลบัญชี เช่น ชื่อผู้ใช้ อีเมล รูปโปรไฟล์ รวมถึงข้อมูลการใช้งาน เช่น ประวัติการอ่าน รายการโปรด การติดตาม คะแนน และความคิดเห็น</p></section>
        <section><h2 className="text-lg font-bold text-[#1B2A41]">ข้อมูลผู้สมัครเป็นนักเขียน</h2><p className="mt-2">หากสมัครเป็นนักเขียน เราเก็บชื่อ–นามสกุลจริง วันเกิด เบอร์โทร และประเทศ/ภูมิภาคเพื่อพิจารณาคำขอ ป้องกันการสวมรอย และติดต่อเรื่องบัญชี ข้อมูลนี้ไม่แสดงต่อสาธารณะและเข้าถึงได้เฉพาะผู้ดูแลที่เกี่ยวข้อง</p></section>
        <section><h2 className="text-lg font-bold text-[#1B2A41]">วัตถุประสงค์การใช้ข้อมูล</h2><p className="mt-2">เราใช้ข้อมูลเพื่อสร้างและรักษาบัญชี บันทึกความคืบหน้าการอ่าน ดูแลความปลอดภัย ป้องกันการละเมิด และปรับปรุงบริการ</p></section>
        <section><h2 className="text-lg font-bold text-[#1B2A41]">การเปิดเผยข้อมูล</h2><p className="mt-2">เราไม่ขายข้อมูลส่วนบุคคล แต่อาจเปิดเผยเท่าที่จำเป็นแก่ผู้ให้บริการระบบหรือเมื่อกฎหมายกำหนด</p></section>
        <section><h2 className="text-lg font-bold text-[#1B2A41]">การจัดเก็บและความปลอดภัย</h2><p className="mt-2">เราใช้มาตรการที่เหมาะสมเพื่อปกป้องข้อมูล แต่ไม่มีระบบออนไลน์ใดรับประกันความปลอดภัยได้ทั้งหมด</p></section>
        <section><h2 className="text-lg font-bold text-[#1B2A41]">สิทธิของผู้ใช้</h2><p className="mt-2">ผู้ใช้สามารถแก้ไขข้อมูลบัญชีหรือขอลบบัญชีและข้อมูลที่เกี่ยวข้องผ่านช่องทางของแพลตฟอร์ม</p></section>
        <section><h2 className="text-lg font-bold text-[#1B2A41]">การเปลี่ยนแปลงนโยบาย</h2><p className="mt-2">เราอาจปรับปรุงนโยบายนี้เป็นระยะ โดยจะแสดงฉบับล่าสุดบนหน้านี้</p></section>
      </div>
      <p className="mt-9 border-t pt-5 text-sm text-[#64748B]">ปรับปรุงล่าสุด: 23 กรกฎาคม 2026</p>
    </article>
  </main>;
}
