import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'SELLER' | 'BUYER';
  isVerified: boolean;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: 'ADMIN' | 'SELLER' | 'BUYER';
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtConfig {
  privateKey: string;
  publicKey: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

export type Role = 'ADMIN' | 'SELLER' | 'BUYER';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown[];
  };
  requestId?: string;
}
