import bcryptjs from 'bcryptjs';
import crypto from 'crypto';

const saltRounds = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return bcryptjs.hash(password, saltRounds);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcryptjs.compare(password, hash);
};

export const generateRandomToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const passwordService = {
  hashPassword,
  verifyPassword,
  generateRandomToken,
};
