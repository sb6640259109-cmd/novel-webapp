import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { signToken } from '@/lib/jwt';
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from '@/lib/cookies';

const publicUserSelect = {
  id: true,
  username: true,
  email: true,
  role: true,
  displayName: true,
  bio: true,
  avatarUrl: true,
};

export async function GET(request) {
  const sessionUser = getAuthUser(request);
  if (!sessionUser) {
    return Response.json({ success: false, message: 'กรุณาเข้าสู่ระบบใหม่' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: publicUserSelect,
  });
  return user
    ? Response.json({ success: true, user })
    : Response.json({ success: false, message: 'ไม่พบบัญชีผู้ใช้' }, { status: 404 });
}

export async function PUT(request) {
  const sessionUser = getAuthUser(request);
  if (!sessionUser) {
    return Response.json({ success: false, message: 'กรุณาเข้าสู่ระบบใหม่' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const username = body.username?.trim();
    const displayName = body.displayName?.trim() || null;
    const bio = body.bio?.trim() || null;
    const avatarUrl = body.avatarUrl?.trim() || null;

    if (!username || username.length < 3 || username.length > 50) {
      return Response.json(
        { success: false, message: 'ชื่อผู้ใช้ต้องมีความยาว 3–50 ตัวอักษร' },
        { status: 400 },
      );
    }
    if (displayName && displayName.length > 100) {
      return Response.json({ success: false, message: 'ชื่อที่แสดงต้องไม่เกิน 100 ตัวอักษร' }, { status: 400 });
    }
    if (bio && bio.length > 500) {
      return Response.json({ success: false, message: 'ประวัติย่อต้องไม่เกิน 500 ตัวอักษร' }, { status: 400 });
    }
    if (avatarUrl && !avatarUrl.startsWith('/uploads/profiles/')) {
      return Response.json({ success: false, message: 'ที่อยู่รูปโปรไฟล์ไม่ถูกต้อง' }, { status: 400 });
    }

    const duplicate = await prisma.user.findFirst({
      where: { username, NOT: { id: sessionUser.id } },
      select: { id: true },
    });
    if (duplicate) {
      return Response.json({ success: false, message: 'ชื่อผู้ใช้นี้ถูกใช้แล้ว' }, { status: 409 });
    }

    const user = await prisma.user.update({
      where: { id: sessionUser.id },
      data: { username, displayName, bio, avatarUrl },
      select: { ...publicUserSelect, firebaseUid: true },
    });

    const token = signToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      ...(user.firebaseUid ? { firebaseUid: user.firebaseUid } : {}),
    });
    const response = NextResponse.json({
      success: true,
      message: 'บันทึกข้อมูลเรียบร้อยแล้ว',
      user: {
        id: user.id, username: user.username, email: user.email, role: user.role,
        displayName: user.displayName, bio: user.bio, avatarUrl: user.avatarUrl,
      },
    });
    response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions(request));
    return response;
  } catch (error) {
    console.error('Update profile error:', error);
    if (error?.code === 'P2025') {
      return Response.json({ success: false, message: 'ไม่พบบัญชีผู้ใช้' }, { status: 404 });
    }
    return Response.json({ success: false, message: 'บันทึกข้อมูลไม่สำเร็จ' }, { status: 500 });
  }
}
