import { Request, Response, NextFunction } from "express";
import { userService } from "../service/user.service";
import { ApiResponse } from "@/types";

const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const profile = await userService.getProfile(user.id);

    const response: ApiResponse = {
      success: true,
      data: profile,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const profile = await userService.updateProfile(user.id, req.body);

    const response: ApiResponse = {
      success: true,
      data: profile,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

const uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Image is required",
      });
    }

    const profile = await userService.uploadAvatar(user.id, image);

    const response: ApiResponse = {
      success: true,
      data: profile,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

const deleteAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const profile = await userService.deleteAvatar(user.id);

    const response: ApiResponse = {
      success: true,
      data: profile,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

const getAddresses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const addresses = await userService.getAddresses(user.id);

    const response: ApiResponse = {
      success: true,
      data: addresses,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

const getAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const address = await userService.getAddress(user.id, id);

    const response: ApiResponse = {
      success: true,
      data: address,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

const createAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const address = await userService.createAddress(user.id, req.body);

    const response: ApiResponse = {
      success: true,
      data: address,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

const updateAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const address = await userService.updateAddress(user.id, id, req.body);

    const response: ApiResponse = {
      success: true,
      data: address,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

const deleteAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    await userService.deleteAddress(user.id, id);

    const response: ApiResponse = {
      success: true,
      data: { message: "Address deleted successfully" },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

const setDefaultAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const address = await userService.setDefaultAddress(user.id, id);

    const response: ApiResponse = {
      success: true,
      data: address,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const userController = {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  getAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
