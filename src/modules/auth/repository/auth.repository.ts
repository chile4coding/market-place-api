import { prisma } from "@/config/database";
import { CreateUserData } from "../types/repository.types";

const createUser = async (data: CreateUserData) => {
  return prisma.user.create({
    data: {
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role || "BUYER",
    },
  });
};

const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

const findUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

const updateUserVerification = async (userId: string, isVerified: boolean) => {
  return prisma.user.update({
    where: { id: userId },
    data: { isVerified },
  });
};

const updateUserMfa = async (
  userId: string,
  mfaSecret: string | null,
  mfaEnabled: boolean,
) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      mfaSecret,
      mfaEnabled,
    },
  });
};

const updatePassword = async (userId: string, passwordHash: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
};

const createEmailVerification = async (email: string, token: string) => {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return prisma.emailVerification.create({
    data: {
      email,
      token,
      expiresAt,
    },
  });
};

const findEmailVerification = async (token: string) => {
  return prisma.emailVerification.findUnique({
    where: { token },
  });
};

const deleteEmailVerification = async (token: string) => {
  return prisma.emailVerification.delete({
    where: { token },
  });
};

const createPasswordReset = async (email: string, token: string) => {
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  return prisma.passwordReset.create({
    data: {
      email,
      token,
      expiresAt,
    },
  });
};

const findPasswordReset = async (token: string) => {
  return prisma.passwordReset.findUnique({
    where: { token },
  });
};

const deletePasswordReset = async (token: string) => {
  return prisma.passwordReset.delete({
    where: { token },
  });
};

const createRefreshToken = async (
  userId: string,
  tokenHash: string,
  expiresAt: Date,
  deviceInfo?: string,
) => {
  return prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      deviceInfo,
    },
  });
};

const findRefreshTokenByHash = async (tokenHash: string) => {
  const tokens = await prisma.refreshToken.findMany({
    where: { tokenHash, isRevoked: false },
    include: { user: true },
    take: 1,
  });
  return tokens[0] || null;
};

const revokeRefreshTokenByHash = async (tokenHash: string) => {
  const tokens = await prisma.refreshToken.findMany({
    where: { tokenHash, isRevoked: false },
  });
  if (tokens.length > 0) {
    return prisma.refreshToken.update({
      where: { id: tokens[0].id },
      data: { isRevoked: true },
    });
  }
  return null;
};

const revokeAllUserRefreshTokens = async (userId: string) => {
  return prisma.refreshToken.updateMany({
    where: { userId, isRevoked: false },
    data: { isRevoked: true },
  });
};

const updateGoogleId = async (userId: string, googleId: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { googleId },
  });
};

export const authRepository = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserVerification,
  updateUserMfa,
  updatePassword,
  createEmailVerification,
  findEmailVerification,
  deleteEmailVerification,
  createPasswordReset,
  findPasswordReset,
  deletePasswordReset,
  createRefreshToken,
  findRefreshTokenByHash,
  revokeRefreshTokenByHash,
  revokeAllUserRefreshTokens,
  updateGoogleId,
};
