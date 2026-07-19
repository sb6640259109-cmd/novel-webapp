import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { getAuthUser } from '@/lib/auth';

export const runtime = 'nodejs';
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function detectImageType(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';
  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e
    && buffer[3] === 0x47 && buffer[4] === 0x0d && buffer[5] === 0x0a
    && buffer[6] === 0x1a && buffer[7] === 0x0a) return 'png';
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF'
    && buffer.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  return null;
}

export async function POST(request) {
  if (!getAuthUser(request)) {
    return Response.json({ success: false, message: 'กรุณาเข้าสู่ระบบใหม่' }, { status: 401 });
  }

  try {
    const file = (await request.formData()).get('file');
    if (!(file instanceof File) || file.size === 0) {
      return Response.json({ success: false, message: 'กรุณาเลือกรูปโปรไฟล์' }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ success: false, message: 'รูปโปรไฟล์ต้องมีขนาดไม่เกิน 5 MB' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = detectImageType(buffer);
    if (!extension) {
      return Response.json({ success: false, message: 'รองรับเฉพาะไฟล์ JPG, PNG และ WebP' }, { status: 400 });
    }

    const directory = path.join(process.cwd(), 'public', 'uploads', 'profiles');
    await mkdir(directory, { recursive: true });
    const filename = `${randomUUID()}.${extension}`;
    await writeFile(path.join(directory, filename), buffer, { flag: 'wx' });
    return Response.json({ success: true, avatarUrl: `/uploads/profiles/${filename}` });
  } catch (error) {
    console.error('Profile avatar upload error:', error);
    return Response.json({ success: false, message: 'อัปโหลดรูปโปรไฟล์ไม่สำเร็จ' }, { status: 500 });
  }
}
