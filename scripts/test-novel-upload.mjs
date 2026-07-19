import dotenv from 'dotenv';
import { readFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { signToken } from '../lib/jwt.js';

dotenv.config({ path: '.env.local', quiet: true });
const baseUrl = 'http://localhost:3000';
const token = signToken({ id: 'e2e-upload-test', email: 'test@local', role: 'ADMIN' });
const headers = { Cookie: `auth_token=${token}` };
let novelId;
let imageUrl;

async function json(response) {
  const body = await response.json();
  if (!response.ok || !body.success) throw new Error(`${response.status}: ${body.message || 'request failed'}`);
  return body;
}

try {
  const image = await readFile('public/uploads/novels/covers/the-last-lantern-keeper.png');
  const form = new FormData();
  form.append('file', new Blob([image], { type: 'image/png' }), 'test-cover.png');
  const uploaded = await json(await fetch(`${baseUrl}/api/uploads/novel-cover`, { method: 'POST', headers, body: form }));
  imageUrl = uploaded.imageUrl;

  const payload = {
    title: 'E2E Upload Test', author: 'Codex Test', genre: 'Test',
    description: 'Temporary end-to-end test', content: 'Test content', rating: 4.2, image: imageUrl,
  };
  const created = await json(await fetch(`${baseUrl}/api/novels`, {
    method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  }));
  novelId = created.novel.id;
  const read = await json(await fetch(`${baseUrl}/api/novels/${novelId}`, { headers }));
  const updated = await json(await fetch(`${baseUrl}/api/novels/${novelId}`, {
    method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, title: 'E2E Upload Test Updated', rating: 4.5 }),
  }));
  console.log(JSON.stringify({
    upload: true, create: true, read: read.novel.id === novelId,
    update: updated.novel.title === 'E2E Upload Test Updated',
    imagePreserved: updated.novel.image === imageUrl,
  }));
} finally {
  if (novelId) await fetch(`${baseUrl}/api/novels/${novelId}`, { method: 'DELETE', headers });
  if (imageUrl) {
    const uploadRoot = path.resolve('public/uploads/novels');
    const target = path.resolve('public', imageUrl.replace(/^\//, ''));
    if (target.startsWith(`${uploadRoot}${path.sep}`)) await unlink(target).catch(() => {});
  }
}
