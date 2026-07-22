import { createAuthClient } from '@/lib/supabase-auth';
import { findUserById } from '@/lib/users';

export const ROLES = Object.freeze({ READER: 'READER', AUTHOR: 'AUTHOR', ADMIN: 'ADMIN' });

export function normalizeRole(role) {
  return role === 'USER' ? ROLES.READER : role || ROLES.READER;
}

export function hasRole(user, allowedRoles) {
  return Boolean(user && allowedRoles.includes(normalizeRole(user.role)));
}

export async function getAuthUser() {
  try {
    const supabase = await createAuthClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    const profile = await findUserById(user.id);
    if (!profile) return null;
    return { ...profile, role: normalizeRole(profile.role) };
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const user = await getAuthUser();
  if (user) return user;
  return new Response(JSON.stringify({ success: false, message: 'ไม่อนุญาตให้เข้าถึง' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}
