import { getSupabase } from '@/lib/supabase';

export const serializeUser = (user) => user && ({
  id: user.id,
  username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
  email: user.email,
  role: user.app_metadata?.role || 'READER',
  displayName: user.user_metadata?.display_name || null,
  bio: user.user_metadata?.bio || null,
  avatarUrl: user.user_metadata?.avatar_url || null,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
});

export async function findUserById(id) {
  const { data, error } = await getSupabase().auth.admin.getUserById(String(id));
  if (error?.status === 404) return null;
  if (error) throw error;
  return serializeUser(data.user);
}

async function allAuthUsers() {
  const users = [];
  for (let page = 1; ; page += 1) {
    const { data, error } = await getSupabase().auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    users.push(...data.users);
    if (data.users.length < 1000) return users;
  }
}

export async function findDuplicateUser({ email, username, excludeId } = {}) {
  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedUsername = username?.trim().toLowerCase();
  const match = (await allAuthUsers()).find((user) => user.id !== excludeId && (
    (normalizedEmail && user.email?.toLowerCase() === normalizedEmail)
    || (normalizedUsername && user.user_metadata?.username?.toLowerCase() === normalizedUsername)
  ));
  return serializeUser(match || null);
}

export async function listUsers() {
  return (await allAuthUsers()).map(serializeUser).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function updateUser(id, data) {
  const current = await findUserById(id);
  if (!current) return null;
  const attributes = {
    user_metadata: {
      username: data.username ?? current.username,
      display_name: data.displayName !== undefined ? data.displayName : current.displayName,
      bio: data.bio !== undefined ? data.bio : current.bio,
      avatar_url: data.avatarUrl !== undefined ? data.avatarUrl : current.avatarUrl,
    },
    app_metadata: { role: data.role ?? current.role },
  };
  const { data: result, error } = await getSupabase().auth.admin.updateUserById(String(id), attributes);
  if (error) throw error;
  return serializeUser(result.user);
}
