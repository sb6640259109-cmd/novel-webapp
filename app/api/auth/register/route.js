import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/jwt';
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from '@/lib/cookies';
import { registerWithFirebase } from '@/lib/firebase';

export async function POST(request) {
  try {
    const body = await request.json();
    const username = body.username?.trim();
    const email = body.email?.trim().toLowerCase();
    const { password } = body;

    if (!username || !email || !password) {
      return Response.json(
        { success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      return Response.json(
        { success: false, message: 'อีเมลหรือชื่อผู้ใช้นี้ถูกใช้แล้ว' },
        { status: 409 }
      );
    }

    const firebaseUser = await registerWithFirebase(email, password);

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        id: firebaseUser.localId || undefined,
        username,
        email,
        password: hashedPassword,
        firebaseUid: firebaseUser.localId || null,
        role: 'READER',
      },
    });

    const tokenPayload = { id: user.id, username, email, role: user.role, firebaseUid: firebaseUser.localId };
    const userData = { id: user.id, username: user.username, email: user.email, role: user.role };

    const token = signToken(tokenPayload);
    const response = NextResponse.json({
      success: true,
      message: 'ลงทะเบียนสำเร็จด้วย Firebase Auth',
      user: userData,
      firebase: {
        uid: firebaseUser.localId,
        email: firebaseUser.email,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions(request));
    return response;
  } catch (error) {
    console.error('Register API error:', error);
    const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการลงทะเบียน';
    const status = message.includes('EMAIL_EXISTS') || message.includes('already') ? 409 : 500;

    return Response.json(
      { success: false, message },
      { status }
    );
  }
}
