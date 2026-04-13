import { z, ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";
import { createValidationError } from "@/utils/AppError";

export const validationSchema = <T extends ZodSchema>(
  schema: T,
  data: unknown,
) => {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw createValidationError("Validation failed", errors);
  }

  return result.data;
};

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = validationSchema(schema, req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
};
