import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/jwt';
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from '@/lib/cookies';
import { normalizeRole } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();
    const { password } = body;

    if (!email || !password) {
      return Response.json(
        { success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return Response.json(
        { success: false, message: 'ไม่พบผู้ใช้นี้ในระบบ' },
        { status: 404 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return Response.json(
        { success: false, message: 'รหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    const role = normalizeRole(user.role);
    const token = signToken({ id: user.id, email: user.email, username: user.username, role });
    const response = NextResponse.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions(request));
    return response;
  } catch (error) {
    console.error('Login API error:', error);
    return Response.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' },
      { status: 500 }
    );
  }
}
