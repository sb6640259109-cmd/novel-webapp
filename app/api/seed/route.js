import { seedNovels } from '@/lib/data-store';

export async function POST() {
  try {
    seedNovels();

    return Response.json({ success: true, message: 'Seed ข้อมูลสำเร็จ' });
  } catch (error) {
    console.error('Seed error:', error);
    return Response.json({ success: false, message: 'Seed ล้มเหลว' }, { status: 500 });
  }
}
