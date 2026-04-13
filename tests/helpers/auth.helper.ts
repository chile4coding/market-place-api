import request, { Response } from "supertest";
import { createApp } from "../../src/app";
import { prisma } from "../../src/config/database";
import type { TestUser } from "../fixtures";
import * as speakeasy from "speakeasy";

export { prisma };

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

export const app = createApp();

export const registerUser = async (user: TestUser): Promise<Response> => {
  return request(app).post("/api/v1/auth/register").send(user);
};

export const verifyEmail = async (email: string): Promise<string> => {
  const verification = await prisma.emailVerification.findFirst({
    where: { email },
  });

  if (!verification) {
    throw new Error(`No verification token found for email: ${email}`);
  }

  const response = await request(app)
    .post("/api/v1/auth/verify-email")
    .send({ token: verification.token });

  return response.status === 200 ? verification.token : "";
};
export const getEmailVerificationToken = async (
  email: string,
): Promise<string> => {
  const verification = await prisma.emailVerification.findFirst({
    where: { email },
  });

  if (!verification) {
    throw new Error(`No verification token found for email: ${email}`);
  }

  return verification.token;
};

export const loginUser = async (
  email: string,
  password: string,
  mfaToken?: string,
): Promise<Response> => {
  const payload: Record<string, string> = { email, password };
  if (mfaToken) {
    payload.mfaToken = mfaToken;
  }

  return request(app).post("/api/v1/auth/login").send(payload);
};

export const getAuthenticatedTokens = async (
  user: TestUser,
): Promise<AuthTokens> => {
  const loginResponse = await loginUser(user.email, user.password);

  if (!loginResponse.body.data?.accessToken) {
    throw new Error("Failed to get access token");
  }

  return {
    accessToken: loginResponse.body.data.accessToken,
    refreshToken: loginResponse.body.data.refreshToken,
    userId: loginResponse.body.data.user.id,
  };
};

export const setupMfa = async (
  accessToken: string,
): Promise<{ qrCode: string; secret: string }> => {
  const response = await request(app)
    .post("/api/v1/auth/mfa/setup")
    .set("Authorization", `Bearer ${accessToken}`);

  if (!response.body.success) {
    throw new Error("Failed to setup MFA");
  }

  const user = await prisma.user.findFirst({
    where: { email: { startsWith: "test_" } },
    orderBy: { createdAt: "desc" },
  });
  if (!user) {
    throw new Error("User not found");
  }

  return {
    qrCode: response.body.data.qrCode,
    secret: user.mfaSecret!,
  };
};

export const verifyMfaToken = async (
  accessToken: string,
  secret: string,
): Promise<string> => {
  const token = speakeasy.totp({ secret, encoding: "base32" });
  const response = await request(app)
    .post("/api/v1/auth/mfa/verify")
    .set("Authorization", `Bearer ${accessToken}`)
    .send({ token });

  if (!response.body.success) {
    throw new Error("Failed to verify MFA token");
  }

  return token;
};

export const disableMfa = async (
  accessToken: string,
  secret: string,
): Promise<void> => {
  const token = speakeasy.totp({ secret, encoding: "base32" });
  await request(app)
    .post("/api/v1/auth/mfa/disable")
    .set("Authorization", `Bearer ${accessToken}`)
    .send({ token });
};

export const getPasswordResetToken = async (email: string): Promise<string> => {
  await request(app).post("/api/v1/auth/forgot-password").send({ email });

  const resetRecord = await prisma.passwordReset.findFirst({
    where: { email },
  });

  return resetRecord?.token || "";
};

export const refreshAccessToken = async (
  refreshToken: string,
): Promise<Response> => {
  return request(app).post("/api/v1/auth/refresh").send({ refreshToken });
};

export const logoutUser = async (
  accessToken: string,
  refreshToken: string,
): Promise<Response> => {
  return request(app)
    .post("/api/v1/auth/logout")
    .set("Authorization", `Bearer ${accessToken}`)
    .send({ refreshToken });
};
