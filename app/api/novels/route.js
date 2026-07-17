import { createNovel, getNovels } from '@/lib/data-store';
import { getAuthUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return new Response(
        JSON.stringify({ success: false, message: 'ไม่อนุญาตให้เข้าถึง' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const novels = getNovels();

    return Response.json({ success: true, novels });
  } catch (error) {
    console.error('Novels API error:', error);
    return Response.json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลนิยาย' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return new Response(
        JSON.stringify({ success: false, message: 'ไม่อนุญาตให้เข้าถึง' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const novel = createNovel({
      title: body.title,
      author: body.author,
      genre: body.genre,
      description: body.description,
      rating: Number(body.rating || 0),
      image: body.image || null,
    });

    return Response.json({ success: true, novel });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, message: 'เพิ่มนิยายไม่สำเร็จ' }, { status: 500 });
  }
}
