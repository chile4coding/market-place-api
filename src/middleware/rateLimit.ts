import rateLimit from "express-rate-limit";

import { Request } from "express";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Too many login attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => process.env.NODE_ENV === "test",
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => process.env.NODE_ENV === "test",
});

export const customRateLimiter = (max: number, windowMs: number) => {
  return rateLimit({
    windowMs,
    max,
    message: { message: "Too many requests, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: Request) => process.env.NODE_ENV === "test",
    keyGenerator: (req: Request) => {
      return req.ip || req.socket.remoteAddress || "unknown";
    },
  });
};
