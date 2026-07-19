import { getAuthUser, hasRole, ROLES } from '@/lib/auth';
import { addNovel, listNovels } from '@/lib/novels';

const samples = [
  { title: 'หอสมุดแห่งดวงดาว', author: 'ลลิน วายุ', genre: 'แฟนตาซี', description: 'เด็กสาวผู้ได้ยินเสียงกระซิบจากหนังสือ ออกตามหาหน้าสุดท้ายก่อนอาณาจักรแห่งเรื่องเล่าจะเลือนหาย', content: null, rating: 4.9, image: null },
  { title: 'จดหมายจากฤดูฝน', author: 'พิมพ์ดาว', genre: 'โรแมนติก', description: 'จดหมายที่ส่งผิดบ้านนำพาคนสองคนให้รู้จักกันผ่านถ้อยคำและร้านกาแฟแห่งเดิม', content: null, rating: 4.7, image: null },
  { title: 'เงาในห้องหมายเลขเจ็ด', author: 'นที รัตติกาล', genre: 'สืบสวน', description: 'นักสืบมือใหม่ตามคดีคนหายในโรงแรมเก่า ซึ่งหลักฐานทุกชิ้นชี้ไปยังห้องที่ไม่มีในแปลนอาคาร', content: null, rating: 4.8, image: null },
];

export async function POST(request) {
  try {
    const user = getAuthUser(request);
    if (!user) return Response.json({ success: false, message: 'กรุณาเข้าสู่ระบบก่อนเพิ่มข้อมูลตัวอย่าง' }, { status: 401 });
    if (!hasRole(user, [ROLES.ADMIN])) return Response.json({ success: false, message: 'เฉพาะ Admin เท่านั้นที่เพิ่มข้อมูลตัวอย่างได้' }, { status: 403 });
    const existingTitles = new Set((await listNovels()).map((novel) => novel.title));
    const missing = samples.filter((novel) => !existingTitles.has(novel.title));
    await Promise.all(missing.map(addNovel));
    return Response.json({ success: true, message: `เพิ่มข้อมูลตัวอย่างใน Firestore ${missing.length} เรื่อง`, created: missing.length });
  } catch (error) {
    console.error('Firestore seed error:', error);
    return Response.json({ success: false, message: 'เพิ่มข้อมูลตัวอย่างใน Firestore ไม่สำเร็จ' }, { status: 500 });
  }
}
