import { Request, Response, NextFunction } from "express";
import { categoryService } from "../service/category.service";
import { ApiResponse } from "@/types";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../schema/category.schema";
import {
  CreateCategoryParams,
  UpdateCategoryParams,
  CategoryType,
} from "../types/category.types";
import { validate } from "@/middleware/validation";
import { File } from "formidable";

const listCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await categoryService.listCategories(
      req.query.parentId as string | undefined,
    );

    const response: ApiResponse = {
      success: true,
      data: categories,
    };

    res.json(response);
  } catch (error) {
    next(error as Error);
  }
};

const listAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await categoryService.listAllCategories();

    const response: ApiResponse = {
      success: true,
      data: categories,
    };

    res.json(response);
  } catch (error) {
    next(error as Error);
  }
};

const getCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const category = await categoryService.getCategoryById(id);

    const response: ApiResponse = {
      success: true,
      data: category,
    };

    res.json(response);
  } catch (error) {
    next(error as Error);
  }
};

const getCategoryBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug } = req.params;
    const category = await categoryService.getCategoryBySlug(slug);

    const response: ApiResponse = {
      success: true,
      data: category,
    };

    res.json(response);
  } catch (error) {
    next(error as Error);
  }
};

const getCategoryTree = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tree = await categoryService.getCategoryTree();

    const response: ApiResponse = {
      success: true,
      data: tree,
    };

    res.json(response);
  } catch (error) {
    next(error as Error);
  }
};

const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = req.body as CreateCategoryParams;
    const category = await categoryService.createCategory(data);

    const response: ApiResponse = {
      success: true,
      data: category,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error as Error);
  }
};

const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const data = req.body as UpdateCategoryParams;
    const category = await categoryService.updateCategory(id, data);

    const response: ApiResponse = {
      success: true,
      data: category,
    };

    res.json(response);
  } catch (error) {
    next(error as Error);
  }
};

const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await categoryService.deleteCategory(id);

    const response: ApiResponse = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error as Error);
  }
};

const uploadCategoryImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const rawFiles = (req.files as { image?: File })?.image;

    const files: File[] = Array.isArray(rawFiles)
      ? rawFiles
      : rawFiles
        ? [rawFiles]
        : [];

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "An image file is required" },
      });
    }

    const file = files[0];
    const category = await categoryService.uploadCategoryImage(id, file);

    const response: ApiResponse = {
      success: true,
      data: category,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error as Error);
  }
};

const deleteCategoryImageHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const category = await categoryService.deleteCategoryImage(id);

    const response: ApiResponse = {
      success: true,
      data: category,
    };

    res.json(response);
  } catch (error) {
    next(error as Error);
  }
};

export const categoryController = {
  listCategories,
  listAllCategories,
  getCategoryById,
  getCategoryBySlug,
  getCategoryTree,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  deleteCategoryImage: deleteCategoryImageHandler,
};
