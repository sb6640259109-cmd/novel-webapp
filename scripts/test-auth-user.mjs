import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mariadb from 'mariadb';
import { randomUUID } from 'node:crypto';

dotenv.config({ path: '.env.local', quiet: true });
const databaseUrl = process.env.DATABASE_URL_LOCAL || process.env.DATABASE_URL;
const url = new URL(databaseUrl);
const pool = mariadb.createPool({
  host: url.hostname, port: Number(url.port || 3306), user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password), database: decodeURIComponent(url.pathname.slice(1)), connectionLimit: 2,
});
const email = 'codex.auth.test@local.invalid';
const password = 'NovelLib-Test-2026!';

try {
  if (process.argv[2] === 'cleanup') {
    await pool.query('DELETE FROM `User` WHERE `email` = ?', [email]);
    console.log(JSON.stringify({ cleaned: true }));
  } else {
    await pool.query('DELETE FROM `User` WHERE `email` = ?', [email]);
    await pool.query(
      'INSERT INTO `User` (`id`,`username`,`email`,`password`,`role`,`createdAt`,`updatedAt`) VALUES (?,?,?,?,?,NOW(),NOW())',
      [randomUUID(), `codex_auth_test_${Date.now()}`, email, await bcrypt.hash(password, 10), 'ADMIN'],
    );
    console.log(JSON.stringify({ prepared: true, email }));
  }
} finally {
  await pool.end();
}
