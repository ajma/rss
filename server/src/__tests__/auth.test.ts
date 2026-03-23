import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma client
vi.mock('../lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import prisma from '../lib/prisma';

describe('Auth Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Registration', () => {
    it('should reject registration with invalid email', async () => {
      const { registerSchema } = await import('./auth.helpers');
      const result = registerSchema.safeParse({
        email: 'not-an-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject registration with short password', async () => {
      const { registerSchema } = await import('./auth.helpers');
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: '12345',
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid registration data', async () => {
      const { registerSchema } = await import('./auth.helpers');
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Login', () => {
    it('should reject login with invalid email', async () => {
      const { loginSchema } = await import('./auth.helpers');
      const result = loginSchema.safeParse({
        email: 'not-an-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid login data', async () => {
      const { loginSchema } = await import('./auth.helpers');
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('JWT', () => {
    it('should generate a valid JWT token', async () => {
      const { generateToken, verifyToken } = await import('./auth.helpers');
      const token = generateToken('user-123');
      const payload = verifyToken(token);
      expect(payload.userId).toBe('user-123');
    });

    it('should reject an invalid JWT token', async () => {
      const { verifyToken } = await import('./auth.helpers');
      expect(() => verifyToken('invalid-token')).toThrow();
    });
  });
});
