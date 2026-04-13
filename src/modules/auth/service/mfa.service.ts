const speakeasy = require("speakeasy");
import QRCode from "qrcode";
import { config } from "@/config";
import { MfaSetupResult } from "../types/mfa.types";

interface UserWithEmail {
  email: string;
}

export const generateSecret = async (
  user: UserWithEmail,
): Promise<MfaSetupResult> => {
  const secret = speakeasy.generateSecret({
    name: `${config.mfa.appName}:${user.email}`,
    issuer: config.mfa.appName,
  });

  return {
    secret: secret.base32 || "",
    otpauthUrl: secret.otpauth_url || "",
    qrCode: "",
  };
};

export const generateQrCode = async (otpauthUrl: string): Promise<string> => {
  return QRCode.toDataURL(otpauthUrl);
};

export const verifyToken = (secret: string, token: string): boolean => {
  const result = speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    step: 30,
    window: 1,
  });
  return result;
};

export const mfaService = {
  generateSecret,
  generateQrCode,
  verifyToken,
};
