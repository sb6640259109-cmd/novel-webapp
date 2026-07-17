import bcrypt from 'bcryptjs';
import { findUserByEmailOrUsername, saveUser } from '@/lib/data-store';
import { signToken } from '@/lib/jwt';
import { setAuthCookie } from '@/lib/cookies';
import { registerWithFirebase } from '@/lib/firebase';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return Response.json(
        { success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    const existingUser = findUserByEmailOrUsername(email, username);

    if (existingUser) {
      return Response.json(
        { success: false, message: 'อีเมลหรือชื่อผู้ใช้นี้ถูกใช้แล้ว' },
        { status: 409 }
      );
    }

    const firebaseUser = await registerWithFirebase(email, password);

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = saveUser({
      id: firebaseUser.localId || `firebase-${email}`,
      username,
      email,
      password: hashedPassword,
      firebaseUid: firebaseUser.localId,
      firebaseToken: firebaseUser.idToken,
    });

    const tokenPayload = { id: user.id, username, email, firebaseUid: firebaseUser.localId };
    const userData = { id: user.id, username: user.username, email: user.email };

    const token = signToken(tokenPayload);
    const cookie = setAuthCookie(token);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'ลงทะเบียนสำเร็จด้วย Firebase Auth',
        user: userData,
        firebase: {
          uid: firebaseUser.localId,
          email: firebaseUser.email,
        },
      }),
      {
        status: 200,
        headers: { 'Set-Cookie': cookie, 'Content-Type': 'application/json' },
      }
    );
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
