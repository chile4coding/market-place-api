import { Request, Response, NextFunction } from "express";
import { authService } from "../service/auth.service";
import { ApiResponse } from "@/types";

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register(req.body);

    const response: ApiResponse = {
      success: true,
      data: result,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error as Error);
  }
};

const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.verifyEmail(req.body.token);

    const response: ApiResponse = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error as Error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body);

    const response: ApiResponse = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error as Error);
  }
};

const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokens = await authService.refresh(req.body.refreshToken);

    const response: ApiResponse = {
      success: true,
      data: tokens,
    };

    res.json(response);
  } catch (error) {
    next(error as Error);
  }
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const refreshToken = req.body.refreshToken;
    const result = await authService.logout(user.id, refreshToken);

    const response: ApiResponse = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error as Error);
  }
};

const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.forgotPassword(req.body.email);

    const response: ApiResponse = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error as Error);
  }
};

const resendVerificationEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.resendVerificationEmail(req.body.email);

    const response: ApiResponse = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error as Error);
  }
};

const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.resetPassword(
      req.body.token,
      req.body.newPassword,
    );

    const response: ApiResponse = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error as Error);
  }
};

const setupMfa = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const result = await authService.setupMfa(user.id);

    const response: ApiResponse = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error as Error);
  }
};

const verifyMfa = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const result = await authService.verifyMfa(user.id, req.body.token);

    const response: ApiResponse = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error as Error);
  }
};

const disableMfa = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const result = await authService.disableMfa(user.id, req.body.token);

    const response: ApiResponse = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error as Error);
  }
};

export const authController = {
  register,
  verifyEmail,
  resendVerificationEmail,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  setupMfa,
  verifyMfa,
  disableMfa,
};
