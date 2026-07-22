import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { getAuthUser, hasRole, ROLES } from '@/lib/auth';

export const runtime = 'nodejs';
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function detectImageType(buffer) {
  const jpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const png = buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50
    && buffer[2] === 0x4e && buffer[3] === 0x47 && buffer[4] === 0x0d
    && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a;
  const webp = buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF'
    && buffer.toString('ascii', 8, 12) === 'WEBP';
  if (jpeg) return 'jpg';
  if (png) return 'png';
  if (webp) return 'webp';
  return null;
}

export async function POST(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return Response.json({ success: false, message: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่ก่อนอัปโหลดภาพ' }, { status: 401 });
    }
    if (!hasRole(user, [ROLES.AUTHOR, ROLES.ADMIN])) {
      return Response.json({ success: false, message: 'คุณไม่มีสิทธิ์อัปโหลดภาพปก' }, { status: 403 });
    }

    const file = (await request.formData()).get('file');
    if (!(file instanceof File) || file.size === 0) {
      return Response.json({ success: false, message: 'กรุณาเลือกไฟล์ภาพ' }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ success: false, message: 'ไฟล์ภาพต้องมีขนาดไม่เกิน 10 MB' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = detectImageType(buffer);
    if (!extension) {
      return Response.json({ success: false, message: 'รองรับเฉพาะไฟล์ JPG, PNG และ WebP เท่านั้น' }, { status: 400 });
    }

    const uploadDirectory = path.join(process.cwd(), 'public', 'uploads', 'novels');
    await mkdir(uploadDirectory, { recursive: true });
    const filename = `${randomUUID()}.${extension}`;
    await writeFile(path.join(uploadDirectory, filename), buffer, { flag: 'wx' });
    return Response.json({ success: true, imageUrl: `/uploads/novels/${filename}` });
  } catch (error) {
    console.error('Novel cover upload error:', error);
    return Response.json({ success: false, message: 'เซิร์ฟเวอร์บันทึกภาพไม่สำเร็จ กรุณาลองอีกครั้ง' }, { status: 500 });
  }
}
