import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const N = 16384;
const R = 8;
const P = 1;
const KEY_LEN = 64;

function derive(password, salt, n, r, p, keyLen) {
  return new Promise((resolve, reject) => {
    scrypt(password.normalize('NFKC'), salt, keyLen, { N: n, r, p, maxmem: 64 * 1024 * 1024 }, (err, key) =>
      err ? reject(err) : resolve(key)
    );
  });
}

/** Formato: scrypt$N$r$p$salt(base64)$hash(base64) */
export async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await derive(password, salt, N, R, P, KEY_LEN);
  return ['scrypt', N, R, P, salt.toString('base64'), key.toString('base64')].join('$');
}

export async function verifyPassword(password, stored) {
  const [scheme, n, r, p, saltB64, hashB64] = String(stored).split('$');
  if (scheme !== 'scrypt' || !hashB64) return false;
  const expected = Buffer.from(hashB64, 'base64');
  const actual = await derive(password, Buffer.from(saltB64, 'base64'), Number(n), Number(r), Number(p), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// Hash descartável usado para igualar o tempo de resposta quando o e-mail não existe.
export const DUMMY_HASH = await hashPassword('senha-descartavel-para-tempo-constante');
