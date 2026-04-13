/// <reference types="jest" />
import request from "supertest";
import * as speakeasy from "speakeasy";

import {
  app,
  registerUser,
  verifyEmail,
  loginUser,
  getAuthenticatedTokens,
  setupMfa,
  verifyMfaToken,
  disableMfa,
  getPasswordResetToken,
  refreshAccessToken,
  logoutUser,
  prisma,
  getEmailVerificationToken,
} from "../helpers";
import { createTestUser, generateTestEmail } from "../fixtures";

describe("Auth API Endpoints", () => {
  describe("POST /api/v1/auth/register", () => {
    it("should register a new user with valid data", async () => {
      const user = await createTestUser();

      const response = await registerUser(user);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.email).toBe(user.email);
      expect(response.body.data.role).toBe(user.role);
      expect(response.body.data.message).toContain("Registration successful");
    });

    it("should register with default BUYER role", async () => {
      const user = await createTestUser("BUYER");

      const response = await registerUser(user);

      expect(response.status).toBe(201);
      expect(response.body.data.role).toBe("BUYER");
    });

    it("should register with SELLER role", async () => {
      const user = await createTestUser("SELLER");

      const response = await registerUser(user);

      expect(response.status).toBe(201);
      expect(response.body.data.role).toBe("SELLER");
    });

    it("should return 400 for duplicate email", async () => {
      const user = await createTestUser();
      await registerUser(user);

      const response = await registerUser(user);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("VALIDATION_ERROR");
    });

    it("should return 400 for invalid email format", async () => {
      const response = await request(app).post("/api/v1/auth/register").send({
        email: "invalid-email",
        password: "TestPassword123",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("VALIDATION_ERROR");
    });

    it("should return 400 for missing email", async () => {
      const response = await request(app).post("/api/v1/auth/register").send({
        password: "TestPassword123",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 for missing password", async () => {
      const response = await request(app).post("/api/v1/auth/register").send({
        email: generateTestEmail(),
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 for weak password", async () => {
      const response = await request(app).post("/api/v1/auth/register").send({
        email: generateTestEmail(),
        password: "weak",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("VALIDATION_ERROR");
    });

    it("should return 400 for password without uppercase", async () => {
      const response = await request(app).post("/api/v1/auth/register").send({
        email: generateTestEmail(),
        password: "testpassword123",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 for password without numbers", async () => {
      const response = await request(app).post("/api/v1/auth/register").send({
        email: generateTestEmail(),
        password: "TestPassword",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/auth/verify-email", () => {
    it("should verify email with valid token", async () => {
      const user = await createTestUser();
      await registerUser(user);

      const verificationToken = await getEmailVerificationToken(user.email);

      const response = await request(app)
        .post("/api/v1/auth/verify-email")
        .send({ token: verificationToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain("verified");
    });

    it("should return 400 for invalid token", async () => {
      const response = await request(app)
        .post("/api/v1/auth/verify-email")
        .send({ token: "invalid-token" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("VALIDATION_ERROR");
    });

    it("should return 400 for missing token", async () => {
      const response = await request(app)
        .post("/api/v1/auth/verify-email")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should login with valid credentials", async () => {
      const user = await createTestUser();
      await registerUser(user);
      await verifyEmail(user.email);

      const response = await loginUser(user.email, user.password);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");
      expect(response.body.data.user).toHaveProperty("id");
      expect(response.body.data.user.email).toBe(user.email);
      expect(response.body.data.user.isVerified).toBe(true);
    });

    it("should return 401 for invalid password", async () => {
      const user = await createTestUser();
      await registerUser(user);
      await verifyEmail(user.email);

      const response = await loginUser(user.email, "WrongPassword123");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("UNAUTHORIZED");
    });

    it("should return 401 for non-existent user", async () => {
      const response = await loginUser(
        "nonexistent@example.com",
        "TestPassword123",
      );

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("UNAUTHORIZED");
    });

    it("should return 401 for unverified email", async () => {
      const user = await createTestUser();
      await registerUser(user);

      const response = await loginUser(user.email, user.password);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("verify your email");
    });

    it("should return 400 for missing email", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ password: "TestPassword123" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 for missing password", async () => {
      const user = await createTestUser();
      await registerUser(user);
      await verifyEmail(user.email);

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: user.email });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/auth/refresh", () => {
    it("should refresh access token with valid token", async () => {
      const user = await createTestUser();
      await registerUser(user);
      await verifyEmail(user.email);

      const loginResponse = await loginUser(user.email, user.password);
      const refreshToken = loginResponse.body.data.refreshToken;

      const response = await refreshAccessToken(refreshToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");
    });

    it("should return 401 for invalid refresh token", async () => {
      const response = await request(app)
        .post("/api/v1/auth/refresh")
        .send({ refreshToken: "invalid-token" });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 for missing refresh token", async () => {
      const response = await request(app).post("/api/v1/auth/refresh").send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 401 for used refresh token", async () => {
      const user = await createTestUser();
      await registerUser(user);
      await verifyEmail(user.email);

      const loginResponse = await loginUser(user.email, user.password);
      const refreshToken = loginResponse.body.data.refreshToken;

      await request(app).post("/api/v1/auth/refresh").send({ refreshToken });

      const response = await request(app)
        .post("/api/v1/auth/refresh")
        .send({ refreshToken });

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    it("should logout successfully with valid tokens", async () => {
      const user = await createTestUser();
      await registerUser(user);
      await verifyEmail(user.email);

      const loginResponse = await loginUser(user.email, user.password);
      const accessToken = loginResponse.body.data.accessToken;
      const refreshToken = loginResponse.body.data.refreshToken;

      const response = await logoutUser(accessToken, refreshToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain("Logged out");
    });

    it("should return 401 without authentication", async () => {
      const user = await createTestUser();
      await registerUser(user);
      await verifyEmail(user.email);

      const loginResponse = await loginUser(user.email, user.password);
      const refreshToken = loginResponse.body.data.refreshToken;

      const response = await request(app)
        .post("/api/v1/auth/logout")
        .send({ refreshToken });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("UNAUTHORIZED");
    });

    it("should return 401 with invalid token", async () => {
      const user = await createTestUser();
      await registerUser(user);
      await verifyEmail(user.email);

      const loginResponse = await loginUser(user.email, user.password);
      const refreshToken = loginResponse.body.data.refreshToken;

      const response = await request(app)
        .post("/api/v1/auth/logout")
        .set("Authorization", "Bearer invalid-token")
        .send({ refreshToken });

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/v1/auth/forgot-password", () => {
    it("should return success message for existing email", async () => {
      const user = await createTestUser();
      await registerUser(user);
      await verifyEmail(user.email);

      const response = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email: user.email });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain("reset link");
    });

    it("should return same message for non-existent email (security)", async () => {
      const response = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email: "nonexistent@example.com" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain("reset link");
    });

    it("should return 400 for invalid email format", async () => {
      const response = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email: "invalid-email" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 for missing email", async () => {
      const response = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/auth/reset-password", () => {
    it("should reset password with valid token", async () => {
      const user = await createTestUser();
      await registerUser(user);
      await verifyEmail(user.email);

      const resetToken = await getPasswordResetToken(user.email);
      const newPassword = "NewPassword123";

      const response = await request(app)
        .post("/api/v1/auth/reset-password")
        .send({ token: resetToken, newPassword });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain("successfully");
    });

    it("should login with new password after reset", async () => {
      const user = await createTestUser();
      await registerUser(user);
      await verifyEmail(user.email);

      const resetToken = await getPasswordResetToken(user.email);
      const newPassword = "NewPassword123";

      await request(app)
        .post("/api/v1/auth/reset-password")
        .send({ token: resetToken, newPassword });

      const loginResponse = await loginUser(user.email, newPassword);
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.data.accessToken).toBeDefined();
    });

    it("should return 400 for invalid token", async () => {
      const response = await request(app)
        .post("/api/v1/auth/reset-password")
        .send({ token: "invalid-token", newPassword: "NewPassword123" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("VALIDATION_ERROR");
    });

    it("should return 400 for weak password", async () => {
      const user = await createTestUser();
      await registerUser(user);
      await verifyEmail(user.email);

      const resetToken = await getPasswordResetToken(user.email);

      const response = await request(app)
        .post("/api/v1/auth/reset-password")
        .send({ token: resetToken, newPassword: "weak" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 for missing token", async () => {
      const response = await request(app)
        .post("/api/v1/auth/reset-password")
        .send({ newPassword: "NewPassword123" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 for missing newPassword", async () => {
      const user = await createTestUser();
      await registerUser(user);
      await verifyEmail(user.email);

      const resetToken = await getPasswordResetToken(user.email);

      const response = await request(app)
        .post("/api/v1/auth/reset-password")
        .send({ token: resetToken });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/auth/mfa/setup", () => {
    it("should setup MFA successfully", async () => {
      const user = await createTestUser();
      await registerUser(user);
      await verifyEmail(user.email);

      const loginResponse = await loginUser(user.email, user.password);
      const accessToken = loginResponse.body.data.accessToken;

      const response = await request(app)
        .post("/api/v1/auth/mfa/setup")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("qrCode");
      expect(response.body.data.message).toContain("Scan the QR code");
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app).post("/api/v1/auth/mfa/setup");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 when MFA already enabled", async () => {
      const user = await createTestUser();
      await registerUser(user);
      await verifyEmail(user.email);

      const loginResponse = await loginUser(user.email, user.password);
      const accessToken = loginResponse.body.data.accessToken;

      await request(app)
        .post("/api/v1/auth/mfa/setup")
        .set("Authorization", `Bearer ${accessToken}`);

      const userRecord = await prisma.user.findFirst({
        where: { email: user.email },
      });

      if (userRecord) {
        await prisma.user.update({
          where: { id: userRecord.id },
          data: { mfaEnabled: true, mfaSecret: "TESTSECRET" },
        });
      }

      const response = await request(app)
        .post("/api/v1/auth/mfa/setup")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/v1/auth/mfa/verify", () => {
    it("should verify MFA token and enable MFA", async () => {
      const user = await createTestUser();
      await registerUser(user);
      await verifyEmail(user.email);

      const loginResponse = await loginUser(user.email, user.password);
      const accessToken = loginResponse.body.data.accessToken;

      const mfaSetupResponse = await request(app)
        .post("/api/v1/auth/mfa/setup")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(mfaSetupResponse.status).toBe(200);

      const userRecord = await prisma.user.findFirst({
        where: { email: user.email },
      });

      const mfaToken = speakeasy.totp({
        secret: userRecord!.mfaSecret!,
        encoding: "base32",
      });

      const response = await request(app)
        .post("/api/v1/auth/mfa/verify")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ token: mfaToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain("enabled");
    });

    it("should return 401 for invalid MFA token", async () => {
      const user = await createTestUser();
      await registerUser(user);
      await verifyEmail(user.email);

      const loginResponse = await loginUser(user.email, user.password);
      const accessToken = loginResponse.body.data.accessToken;

      await request(app)
        .post("/api/v1/auth/mfa/setup")
        .set("Authorization", `Bearer ${accessToken}`);

      const response = await request(app)
        .post("/api/v1/auth/mfa/verify")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ token: "123456" });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("UNAUTHORIZED");
    });

    it("should return 400 for missing token", async () => {
      const user = await createTestUser();
      await registerUser(user);
      await verifyEmail(user.email);

      const loginResponse = await loginUser(user.email, user.password);
      const accessToken = loginResponse.body.data.accessToken;

      const response = await request(app)
        .post("/api/v1/auth/mfa/verify")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app)
        .post("/api/v1/auth/mfa/verify")
        .send({ token: "123456" });

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/v1/auth/mfa/disable", () => {
    it("should disable MFA with valid token", async () => {
      const user = await createTestUser();
      await registerUser(user);
      await verifyEmail(user.email);

      const loginResponse = await loginUser(user.email, user.password);
      const accessToken = loginResponse.body.data.accessToken;

      const mfaSetupResponse = await request(app)
        .post("/api/v1/auth/mfa/setup")
        .set("Authorization", `Bearer ${accessToken}`);

      const userRecord = await prisma.user.findFirst({
        where: { email: user.email },
      });

      const mfaToken = speakeasy.totp({
        secret: userRecord!.mfaSecret!,
        encoding: "base32",
      });

      await request(app)
        .post("/api/v1/auth/mfa/verify")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ token: mfaToken });

      const disableResponse = await request(app)
        .post("/api/v1/auth/mfa/disable")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ token: mfaToken });

      expect(disableResponse.status).toBe(200);
      expect(disableResponse.body.success).toBe(true);
      expect(disableResponse.body.data.message).toContain("disabled");
    });

    it("should return 401 for invalid MFA token", async () => {
      const user = await createTestUser();
      await registerUser(user);
      await verifyEmail(user.email);

      const loginResponse = await loginUser(user.email, user.password);
      const accessToken = loginResponse.body.data.accessToken;

      const userRecord = await prisma.user.findFirst({
        where: { email: user.email },
      });

      if (userRecord) {
        await prisma.user.update({
          where: { id: userRecord.id },
          data: { mfaEnabled: true, mfaSecret: "TESTSECRET" },
        });
      }

      const response = await request(app)
        .post("/api/v1/auth/mfa/disable")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ token: "123456" });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 when MFA not enabled", async () => {
      const user = await createTestUser();
      await registerUser(user);
      await verifyEmail(user.email);

      const loginResponse = await loginUser(user.email, user.password);
      const accessToken = loginResponse.body.data.accessToken;

      const response = await request(app)
        .post("/api/v1/auth/mfa/disable")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ token: "123456" });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /health", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("ok");
      expect(response.body).toHaveProperty("timestamp");
    });
  });
});
