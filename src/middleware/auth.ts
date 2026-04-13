import { Request, Response, NextFunction } from "express";
import { jwtService } from "@/modules/auth/service/jwt.service";
import {
  createUnauthorizedError,
  createForbiddenError,
} from "@/utils/AppError";
import { AuthUser, Role } from "@/types";
import { redis } from "@/config/redis";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const LOGOUT_KEY_PREFIX = "logout:";

const checkUserLoggedOut = async (
  userId: string,
  tokenIssuedAt: number,
): Promise<boolean> => {
  const logoutTime = await redis.get(`${LOGOUT_KEY_PREFIX}${userId}`);

  if (!logoutTime) return false;
  const isLoggedOut = tokenIssuedAt < parseInt(logoutTime, 10);

  return isLoggedOut;
};

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw createUnauthorizedError("No token provided");
    }

    const token = authHeader.split(" ")[1];
    const payload = jwtService.verifyAccessToken(token);

    const isLoggedOut = await checkUserLoggedOut(payload.sub, payload.iat || 0);
    if (isLoggedOut) {
      throw createUnauthorizedError("Session expired. Please login again.");
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      isVerified: true,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw createUnauthorizedError("Not authenticated");
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw createForbiddenError("Insufficient permissions");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const payload = jwtService.verifyAccessToken(token);

      req.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        isVerified: true,
      };
    }

    next();
  } catch (error) {
    next();
  }
};
