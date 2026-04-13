import { authRepository } from "../repository/auth.repository";
import { passwordService } from "./password.service";
import { jwtService } from "./jwt.service";
import { mfaService } from "./mfa.service";
import { addEmailJob } from "@/jobs";
import {
  createValidationError,
  createUnauthorizedError,
  createNotFoundError,
} from "@/utils/AppError";
import { Role, Tokens } from "@/types";
import { LoginParams, RegisterParams } from "../types/auth.types";
import { redis } from "@/config/redis";
import { userRepository } from "@/modules/users/repository/user.repository";

const LOGOUT_KEY_PREFIX = "logout:";

export const register = async (params: RegisterParams) => {
  const existingUser = await authRepository.findUserByEmail(params.email);
  if (existingUser) {
    throw createValidationError("Email already registered");
  }

  const passwordHash = await passwordService.hashPassword(params.password);
  const user = await authRepository.createUser({
    email: params.email,
    passwordHash,
    role: params.role || "BUYER",
  });

  await userRepository.createProfile(user.id, {});

  const verificationToken = passwordService.generateRandomToken();
  await authRepository.createEmailVerification(params.email, verificationToken);

  await addEmailJob({
    type: "verification",
    to: params.email,
    data: { token: verificationToken },
  });

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    message:
      "Registration successful. Please check your email to verify your account.",
  };
};

export const verifyEmail = async (token: string) => {
  const verification = await authRepository.findEmailVerification(token);
  if (!verification) {
    throw createValidationError("Invalid verification token");
  }

  if (verification.expiresAt < new Date()) {
    await authRepository.deleteEmailVerification(token);
    throw createValidationError("Verification token expired");
  }

  const user = await authRepository.findUserByEmail(verification.email);
  if (!user) {
    throw createNotFoundError("User not found");
  }

  await authRepository.updateUserVerification(user.id, true);
  await authRepository.deleteEmailVerification(token);

  return { message: "Email verified successfully" };
};

export const login = async (params: LoginParams) => {
  const user = await authRepository.findUserByEmail(params.email);
  if (!user) {
    throw createUnauthorizedError("Invalid credentials");
  }

  if (user.googleId && !user.passwordHash) {
    throw createUnauthorizedError("Please login with Google");
  }

  if (!user.isVerified) {
    throw createUnauthorizedError("Please verify your email first");
  }

  if (!user.googleId) {
    const isValidPassword = await passwordService.verifyPassword(
      params.password,
      user.passwordHash,
    );
    if (!isValidPassword) {
      throw createUnauthorizedError("Invalid credentials");
    }
  }

  if (user.mfaEnabled && !params.mfaToken) {
    return {
      requiresMfa: true,
      message: "MFA token required",
    };
  }

  if (user.mfaEnabled && params.mfaToken) {
    const isValid = mfaService.verifyToken(user.mfaSecret!, params.mfaToken);
    if (!isValid) {
      throw createUnauthorizedError("Invalid MFA token");
    }
  }

  const tokens = jwtService.generateTokens({
    id: user.id,
    email: user.email,
    role: user.role,
    iat: Date.now(),
  });

  const tokenHash = jwtService.hashToken(tokens.refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await authRepository.createRefreshToken(user.id, tokenHash, expiresAt);

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      mfaEnabled: user.mfaEnabled,
    },
    ...tokens,
  };
};

export const refresh = async (refreshToken: string) => {
  const payload = jwtService.verifyRefreshToken(refreshToken);
  const tokenHash = jwtService.hashToken(refreshToken);

  const storedToken = await authRepository.findRefreshTokenByHash(tokenHash);
  if (!storedToken) {
    throw createUnauthorizedError("Invalid refresh token");
  }

  if (storedToken.expiresAt < new Date()) {
    throw createUnauthorizedError("Refresh token expired");
  }

  await authRepository.revokeRefreshTokenByHash(tokenHash);

  const user = await authRepository.findUserById(payload.sub);
  if (!user || !user.isVerified) {
    throw createUnauthorizedError("User not found or not verified");
  }

  const tokens = jwtService.generateTokens({
    id: user.id,
    email: user.email,
    role: user.role,
    iat: Date.now(),
  });

  const newTokenHash = jwtService.hashToken(tokens.refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await authRepository.createRefreshToken(user.id, newTokenHash, expiresAt);

  return tokens;
};

export const logout = async (userId: string, refreshToken?: string) => {
  if (refreshToken) {
    const tokenHash = jwtService.hashToken(refreshToken);
    await authRepository.revokeRefreshTokenByHash(tokenHash);
  } else {
    await authRepository.revokeAllUserRefreshTokens(userId);
  }

  await redis.setex(
    `${LOGOUT_KEY_PREFIX}${userId}`,
    15 * 60,
    Date.now().toString(),
  );

  return { message: "Logged out successfully" };
};

export const forgotPassword = async (email: string) => {
  const user = await authRepository.findUserByEmail(email);
  if (!user) {
    return { message: "If the email exists, a reset link will be sent" };
  }

  const resetToken = passwordService.generateRandomToken();
  await authRepository.createPasswordReset(email, resetToken);

  await addEmailJob({
    type: "password-reset",
    to: email,
    data: { token: resetToken },
  });

  return { message: "If the email exists, a reset link will be sent" };
};

export const resetPassword = async (token: string, newPassword: string) => {
  const reset = await authRepository.findPasswordReset(token);
  if (!reset) {
    throw createValidationError("Invalid reset token");
  }

  if (reset.expiresAt < new Date()) {
    await authRepository.deletePasswordReset(token);
    throw createValidationError("Reset token expired");
  }

  const user = await authRepository.findUserByEmail(reset.email);
  if (!user) {
    throw createNotFoundError("User not found");
  }

  const passwordHash = await passwordService.hashPassword(newPassword);
  await authRepository.updatePassword(user.id, passwordHash);
  await authRepository.revokeAllUserRefreshTokens(user.id);
  await authRepository.deletePasswordReset(token);

  return { message: "Password reset successfully" };
};

export const setupMfa = async (userId: string) => {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    throw createNotFoundError("User not found");
  }

  if (user.mfaEnabled) {
    throw createValidationError("MFA already enabled");
  }

  const mfaData = await mfaService.generateSecret(user);

  const qrCode = await mfaService.generateQrCode(mfaData.otpauthUrl);

  await authRepository.updateUserMfa(userId, mfaData.secret, false);

  return {
    qrCode,
    message:
      "Scan the QR code with your authenticator app, then verify with a token",
  };
};

export const verifyMfa = async (userId: string, token: string) => {
  const user = await authRepository.findUserById(userId);

  if (!user) {
    throw createNotFoundError("User not found");
  }

  if (!user.mfaSecret) {
    throw createValidationError("MFA not set up");
  }

  const isValid = mfaService.verifyToken(user.mfaSecret, token);

  if (!isValid) {
    throw createUnauthorizedError("Invalid MFA token");
  }

  await authRepository.updateUserMfa(userId, user.mfaSecret, true);

  return { message: "MFA enabled successfully" };
};

export const disableMfa = async (userId: string, token: string) => {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    throw createNotFoundError("User not found");
  }

  if (!user.mfaEnabled) {
    throw createValidationError("MFA not enabled");
  }

  const isValid = mfaService.verifyToken(user.mfaSecret!, token);
  if (!isValid) {
    throw createUnauthorizedError("Invalid MFA token");
  }

  await authRepository.updateUserMfa(userId, null, false);

  return { message: "MFA disabled successfully" };
};

// when he wants to enable the mfa
// when he wants to disable the mfa
//

export const handleGoogleAuth = async (userData: {
  googleId: string;
  email: string;
  role?: Role;
}) => {
  let user = await authRepository.findUserByEmail(userData.email);

  if (!user) {
    const passwordHash = await passwordService.hashPassword(
      passwordService.generateRandomToken(),
    );
    const newUser = await authRepository.createUser({
      email: userData.email,
      passwordHash,
      role: userData.role || "BUYER",
    });
    await authRepository.updateGoogleId(newUser.id, userData.googleId);
    user = newUser;
  } else if (!user.googleId) {
    await authRepository.updateGoogleId(user.id, userData.googleId);
  }

  const tokens = jwtService.generateTokens({
    id: user.id,
    email: user.email,
    role: user.role,
    iat: Date.now(),
  });

  const tokenHash = jwtService.hashToken(tokens.refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await authRepository.createRefreshToken(user.id, tokenHash, expiresAt);

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
    ...tokens,
  };
};

export const authService = {
  register,
  verifyEmail,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  setupMfa,
  verifyMfa,
  disableMfa,
  handleGoogleAuth,
};
