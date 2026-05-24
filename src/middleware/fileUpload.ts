import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "@/types";
import formidable from "express-formidable";
import { File } from "formidable";

export const fileUpload = (req: Request, res: Response, next: NextFunction) => {
  formidable()(req, res, (err) => {
    if (err) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "File upload failed",
        },
        requestId: req.headers["x-request-id"] as string,
      };
      return res.status(400).json(response);
    }

    const files = req.files as Record<string, File[]>;
    const filesArray = Object.keys(files);

    if (filesArray.length === 0) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "No file attached",
        },
        requestId: req.headers["x-request-id"] as string,
      };
      return res.status(400).json(response);
    }

    next();
  });
};

