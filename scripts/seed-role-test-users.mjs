import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mariadb from 'mariadb';
import { getAuth } from 'firebase-admin/auth';
import { getFirebaseAdminApp } from '../lib/firebase-admin.js';

dotenv.config({ path: '.env', quiet: true });
dotenv.config({ path: '.env.local', quiet: true });

const password = process.env.ROLE_TEST_PASSWORD || 'NovelLib-Test-2026!';
const users = [
  { username: 'reader_test', email: 'reader@novellib.test', role: 'READER' },
  { username: 'author_test', email: 'author@novellib.test', role: 'AUTHOR' },
  { username: 'admin_test', email: 'admin@novellib.test', role: 'ADMIN' },
];

const databaseUrl = process.env.DATABASE_URL_LOCAL || process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is not configured');
const url = new URL(databaseUrl);
const pool = mariadb.createPool({
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: decodeURIComponent(url.pathname.slice(1)),
  connectionLimit: 2,
});
const firebaseAuth = getAuth(getFirebaseAdminApp());

try {
  for (const item of users) {
    let firebaseUser;
    try {
      firebaseUser = await firebaseAuth.getUserByEmail(item.email);
      firebaseUser = await firebaseAuth.updateUser(firebaseUser.uid, {
        password,
        displayName: item.username,
        disabled: false,
      });
    } catch (error) {
      if (error?.code !== 'auth/user-not-found') throw error;
      firebaseUser = await firebaseAuth.createUser({
        email: item.email,
        password,
        displayName: item.username,
        emailVerified: true,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO User (id, username, email, password, firebaseUid, role, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE username=VALUES(username), password=VALUES(password),
       firebaseUid=VALUES(firebaseUid), role=VALUES(role), updatedAt=NOW()`,
      [firebaseUser.uid, item.username, item.email, hashedPassword, firebaseUser.uid, item.role],
    );
    console.log(`${item.role}: ${item.email}`);
  }
  console.log(`PASSWORD: ${password}`);
} finally {
  await pool.end();
}
