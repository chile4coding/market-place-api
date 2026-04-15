import { NextFunction, Request, Response } from "express";
import formidable from "express-formidable";
import { File } from "formidable";

export const fileUpload = (req: Request, res: Response, next: NextFunction) => {
  formidable()(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: "File upload failed" });
    }

    const files = req.files as Record<string, File[]>;
    const filesArray = Object.keys(files);

    if (filesArray.length === 0) {
      return res.status(400).json({ error: "No file attached" });
    }

    next();
  });
};
