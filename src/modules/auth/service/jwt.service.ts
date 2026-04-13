import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { config } from "@/config";
import { Tokens } from "@/types";
import { AppError } from "@/utils/AppError";
import { TokenPayload } from "../types/jwt.types";

let privateKey: string;
let publicKey: string;

const initializeKeys = () => {
  if (!privateKey || !publicKey) {
    if (!config.jwt.privateKey || !config.jwt.publicKey) {
      const keyPair = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" },
      });
      privateKey = keyPair.privateKey;
      publicKey = keyPair.publicKey;
      console.log("Generated RSA key pair for JWT");
    } else {
      privateKey = config.jwt.privateKey;
      publicKey = config.jwt.publicKey;
    }
  }
};

export const generateAccessToken = (payload: TokenPayload): string => {
  initializeKeys();
  const options: SignOptions = {
    algorithm: "RS256",
    expiresIn: "15m",
  };
  return jwt.sign(payload, privateKey, options);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  initializeKeys();
  const options: SignOptions = {
    algorithm: "RS256",
    expiresIn: "7d",
  };
  return jwt.sign(payload, privateKey, options);
};

export const generateTokens = (user: {
  id: string;
  email: string;
  role: "ADMIN" | "SELLER" | "BUYER";
  iat: number;
}): Tokens => {
  const payload: TokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    iat: user.iat,
  };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

export const verifyAccessToken = (token: string): TokenPayload => {
  initializeKeys();
  try {
    return jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    }) as TokenPayload;
  } catch (error) {
    console.log("Error verifying access token:", error);
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError("Token expired", 401, "TOKEN_EXPIRED");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError("Invalid token", 401, "INVALID_TOKEN");
    }
    throw error;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  initializeKeys();
  try {
    return jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    }) as TokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError("Refresh token expired", 401, "REFRESH_TOKEN_EXPIRED");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
    }
    throw error;
  }
};

export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const jwtService = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
};
