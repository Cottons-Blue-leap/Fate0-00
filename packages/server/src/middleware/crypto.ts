import { scrypt, randomBytes, timingSafeEqual } from 'crypto';

export function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(16).toString('hex');
    scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      else resolve(`${salt}:${key.toString('hex')}`);
    });
  });
}

export function verifyPassword(password: string, stored: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return resolve(false);
    scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      else resolve(timingSafeEqual(Buffer.from(hash, 'hex'), key));
    });
  });
}
