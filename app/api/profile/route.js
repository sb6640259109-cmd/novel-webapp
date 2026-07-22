import { findDuplicateUser, findUserById, updateUser } from '@/lib/users';
import { getAuthUser } from '@/lib/auth';
import { createAuthClient } from '@/lib/supabase-auth';

export async function GET(request) {
  const sessionUser = await getAuthUser(request);
  if (!sessionUser) {
    return Response.json({ success: false, message: 'กรุณาเข้าสู่ระบบใหม่' }, { status: 401 });
  }

  const user = await findUserById(sessionUser.id);
  return user
    ? Response.json({ success: true, user })
    : Response.json({ success: false, message: 'ไม่พบบัญชีผู้ใช้' }, { status: 404 });
}

export async function PUT(request) {
  const sessionUser = await getAuthUser(request);
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

    const duplicate = await findDuplicateUser({ username, excludeId: sessionUser.id });
    if (duplicate) {
      return Response.json({ success: false, message: 'ชื่อผู้ใช้นี้ถูกใช้แล้ว' }, { status: 409 });
    }

    const user = await updateUser(sessionUser.id, { username, displayName, bio, avatarUrl });

    const supabase = await createAuthClient();
    await supabase.auth.updateUser({ data: { username: user.username, display_name: user.displayName } });
    return Response.json({
      success: true,
      message: 'บันทึกข้อมูลเรียบร้อยแล้ว',
      user: {
        id: user.id, username: user.username, email: user.email, role: user.role,
        displayName: user.displayName, bio: user.bio, avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    if (error?.code === 'P2025') {
      return Response.json({ success: false, message: 'ไม่พบบัญชีผู้ใช้' }, { status: 404 });
    }
    return Response.json({ success: false, message: 'บันทึกข้อมูลไม่สำเร็จ' }, { status: 500 });
  }
}
