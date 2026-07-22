import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env', quiet: true });
dotenv.config({ path: '.env.local', quiet: true, override: true });
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Supabase admin credentials are not configured');
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const password = process.env.ROLE_TEST_PASSWORD;
if (!password || password.length < 8) throw new Error('ROLE_TEST_PASSWORD must contain at least 8 characters');
const users = [
  { username: 'reader_demo', email: 'reader@test.com', role: 'READER' },
  { username: 'author_demo', email: 'author@test.com', role: 'AUTHOR' },
  { username: 'admin_demo', email: 'admin@test.com', role: 'ADMIN' },
];

const { data: page, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (listError) throw listError;
for (const item of users) {
  const existing = page.users.find((user) => user.email === item.email);
  const result = existing
    ? await supabase.auth.admin.updateUserById(existing.id, { password, email_confirm: true, user_metadata: { username: item.username }, app_metadata: { role: item.role } })
    : await supabase.auth.admin.createUser({ email: item.email, password, email_confirm: true, user_metadata: { username: item.username }, app_metadata: { role: item.role } });
  if (result.error) throw result.error;
  const { error } = await supabase.from('profiles').update({ username: item.username, role: item.role }).eq('id', result.data.user.id);
  if (error) throw error;
  console.log(`${item.role}: ${item.email}`);
}
console.log(`PASSWORD: ${password}`);
