import { getAuthUser } from '@/lib/auth';
import { getReadingHistory, saveReadingProgress } from '@/lib/reader-data';

export async function GET(request) {
  const user = await getAuthUser(request);
  if (!user) return Response.json({ success: false, message: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 });
  return Response.json({ success: true, history: await getReadingHistory(user.id) });
}

export async function POST(request) {
  const user = await getAuthUser(request);
  if (!user) return Response.json({ success: false, message: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 });
  const body = await request.json();
  if (!body.novelId) return Response.json({ success: false, message: 'ข้อมูลนิยายไม่ถูกต้อง' }, { status: 400 });
  await saveReadingProgress(user, body);
  return Response.json({ success: true });
}
