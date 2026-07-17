import bcrypt from 'bcryptjs';
import { findUserByEmail } from '@/lib/data-store';
import { signToken } from '@/lib/jwt';
import { setAuthCookie } from '@/lib/cookies';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' },
        { status: 400 }
      );
    }

    const user = findUserByEmail(email);

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

    const token = signToken({ id: user.id, email: user.email, username: user.username });
    const cookie = setAuthCookie(token);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'เข้าสู่ระบบสำเร็จ',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      }),
      {
        status: 200,
        headers: { 'Set-Cookie': cookie, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Login API error:', error);
    return Response.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' },
      { status: 500 }
    );
  }
}
