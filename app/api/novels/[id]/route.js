import { deleteNovel, getNovelById, updateNovel } from '@/lib/data-store';
import { getAuthUser } from '@/lib/auth';

function authResponse() {
  return new Response(
    JSON.stringify({ success: false, message: 'ไม่อนุญาตให้เข้าถึง' }),
    { status: 401, headers: { 'Content-Type': 'application/json' } }
  );
}

export async function GET(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return authResponse();

    const { id } = params;
    const novel = getNovelById(id);

    if (!novel) {
      return Response.json({ success: false, message: 'ไม่พบนิยาย' }, { status: 404 });
    }

    return Response.json({ success: true, novel });
  } catch (error) {
    return Response.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return authResponse();

    const { id } = params;
    const body = await request.json();

    const updated = updateNovel(id, {
      title: body.title,
      author: body.author,
      genre: body.genre,
      description: body.description,
      rating: Number(body.rating || 0),
      image: body.image || null,
    });

    return Response.json({ success: true, novel: updated });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, message: 'แก้ไขนิยายไม่สำเร็จ' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return authResponse();

    const { id } = params;
    deleteNovel(id);

    return Response.json({ success: true, message: 'ลบนิยายสำเร็จ' });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, message: 'ลบนิยายไม่สำเร็จ' }, { status: 500 });
  }
}
