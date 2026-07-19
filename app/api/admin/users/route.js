import prisma from '@/lib/prisma';
import { getAuthUser, hasRole, ROLES } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { getAuth } from 'firebase-admin/auth';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { listNovels } from '@/lib/novels';

function requireAdmin(request) {
  const user = getAuthUser(request);
  return hasRole(user, [ROLES.ADMIN]) ? user : null;
}

export async function GET(request) {
  if (!requireAdmin(request)) return Response.json({ success: false, message: 'เฉพาะ Admin เท่านั้น' }, { status: 403 });
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, username: true, email: true, role: true, displayName: true, createdAt: true },
  });
  return Response.json({ success: true, users });
}

export async function PUT(request) {
  const admin = requireAdmin(request);
  if (!admin) return Response.json({ success: false, message: 'เฉพาะ Admin เท่านั้น' }, { status: 403 });
  const body = await request.json();
  const role = String(body.role || '').toUpperCase();
  if (!['READER', 'AUTHOR', 'ADMIN'].includes(role)) return Response.json({ success: false, message: 'Role ไม่ถูกต้อง' }, { status: 400 });
  if (!body.userId) return Response.json({ success: false, message: 'ไม่พบรหัสผู้ใช้' }, { status: 400 });
  const username = body.username?.trim();
  const displayName = body.displayName?.trim() || null;
  if (username && (username.length < 3 || username.length > 50)) return Response.json({ success: false, message: 'ชื่อผู้ใช้ต้องมี 3–50 ตัวอักษร' }, { status: 400 });
  const user = await prisma.user.update({
    where: { id: String(body.userId) },
    data: { role, ...(username ? { username } : {}), ...(body.displayName !== undefined ? { displayName } : {}) },
    select: { id: true, username: true, email: true, role: true, displayName: true, createdAt: true },
  });
  return Response.json({ success: true, message: 'อัปเดตสิทธิ์เรียบร้อยแล้ว', user });
}

export async function POST(request) {
  if (!requireAdmin(request)) return Response.json({ success: false, message: 'เฉพาะ Admin เท่านั้น' }, { status: 403 });
  const body = await request.json();
  const username = body.username?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  if (!username || username.length < 3 || username.length > 50 || !email || !/^\S+@\S+\.\S+$/.test(email) || !password || password.length < 8) {
    return Response.json({ success: false, message: 'กรุณากรอกชื่อ อีเมล และรหัสผ่านอย่างน้อย 8 ตัวอักษรให้ถูกต้อง' }, { status: 400 });
  }
  if (await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } })) return Response.json({ success: false, message: 'อีเมลหรือชื่อผู้ใช้นี้ถูกใช้แล้ว' }, { status: 409 });
  let firebaseUser;
  try {
    firebaseUser = await getAuth(getFirebaseAdminApp()).createUser({ email, password, displayName: username, emailVerified: true });
    const user = await prisma.user.create({
      data: { id: firebaseUser.uid, firebaseUid: firebaseUser.uid, username, email, password: await bcrypt.hash(password, 10), role: 'AUTHOR' },
      select: { id: true, username: true, email: true, role: true, displayName: true, createdAt: true },
    });
    return Response.json({ success: true, message: 'เพิ่มนักเขียนเรียบร้อยแล้ว', user }, { status: 201 });
  } catch (error) {
    if (firebaseUser) await getAuth(getFirebaseAdminApp()).deleteUser(firebaseUser.uid).catch(() => {});
    return Response.json({ success: false, message: error?.message || 'เพิ่มนักเขียนไม่สำเร็จ' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const admin = requireAdmin(request);
  if (!admin) return Response.json({ success: false, message: 'เฉพาะ Admin เท่านั้น' }, { status: 403 });
  const userId = new URL(request.url).searchParams.get('userId');
  if (!userId || userId === admin.id) return Response.json({ success: false, message: 'ไม่สามารถลบบัญชีนี้ได้' }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return Response.json({ success: false, message: 'ไม่พบผู้ใช้งาน' }, { status: 404 });
  if ((await listNovels()).some((novel) => novel.ownerId === userId)) return Response.json({ success: false, message: 'นักเขียนยังมีผลงาน กรุณาจัดการผลงานก่อนลบบัญชี' }, { status: 409 });
  await prisma.user.delete({ where: { id: userId } });
  if (user.firebaseUid) await getAuth(getFirebaseAdminApp()).deleteUser(user.firebaseUid).catch(() => {});
  return Response.json({ success: true, message: 'ลบนักเขียนเรียบร้อยแล้ว' });
}
