import { categoryRepository } from "../repository/category.repository";
import {
  CreateCategoryParams,
  CategoryType,
  UpdateCategoryParams,
} from "../types/category.types";
import {
  createValidationError,
  createNotFoundError,
  createForbiddenError,
  createConflictError,
} from "@/utils/AppError";
import {
  uploadImage,
  deleteImage,
  cloudinary as cloudinaryLib,
} from "@/config/cloudinary";
import { File } from "formidable";
import { slugify } from "@/utils/helper";

const generateUniqueSlug = async (
  name: string,
  excludeId?: string,
): Promise<string> => {
  const baseSlug = slugify(name);
  let slug = `${baseSlug}-category`;
  return slug;
};

type CategoryTreeItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: { products: number };
  children: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    products?: Array<{ id: string }>;
  }>;
};

const buildCategoryResponse = <T extends CategoryType | CategoryTreeItem>(
  category: T,
): CategoryType => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
  description: category.description,
  imageUrl: category.imageUrl,
  parentId: (category as CategoryType).parentId ?? null,
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
  children: (category.children as CategoryType[]) ?? [],
});

const listCategories = async (parentId?: string): Promise<CategoryType[]> => {
  const categories = await categoryRepository.listCategories(parentId);
  return categories.map(buildCategoryResponse);
};

const listAllCategories = async (): Promise<CategoryType[]> => {
  const categories = await categoryRepository.findAllCategories();
  return categories.map(buildCategoryResponse);
};

const getCategoryById = async (id: string): Promise<CategoryType> => {
  const category = await categoryRepository.findCategoryWithChildren(id);

  if (!category) {
    throw createNotFoundError("Category not found");
  }

  return buildCategoryResponse(category);
};

const getCategoryBySlug = async (slug: string): Promise<CategoryType> => {
  const category = await categoryRepository.findCategoryBySlug(slug);

  if (!category) {
    throw createNotFoundError("Category not found");
  }

  return buildCategoryResponse(category);
};

const getCategoryTree = async (): Promise<CategoryType[]> => {
  const categories = await categoryRepository.findCategoryTree();
  return categories.map(buildCategoryResponse);
};

const getRootCategories = async (): Promise<CategoryType[]> => {
  const categories = await categoryRepository.findRootCategories();
  return categories.map(buildCategoryResponse);
};

const createCategory = async (
  data: CreateCategoryParams,
): Promise<CategoryType> => {
  const existing = await categoryRepository.findCategoryByName(data.name);
  if (existing) {
    throw createConflictError("A category with this name already exists");
  }
  const category = await categoryRepository.createCategory({
    name: data.name,
    slug: await generateUniqueSlug(data.name),
    description: data.description || null,
    imageUrl: data.imageUrl || null,
    parentId: data.parentId || null,
  });

  return category as CategoryType;
};

const updateCategory = async (
  id: string,
  data: UpdateCategoryParams,
): Promise<CategoryType> => {
  const existing = await categoryRepository.findCategoryById(id);

  if (!existing) {
    throw createNotFoundError("Category not found");
  }

  if (data.slug && data.slug !== (existing as any).slug) {
    const isUnique = await categoryRepository.isSlugUnique(data.slug, id);
    if (!isUnique) {
      throw createConflictError("A category with this slug already exists");
    }
  }

  if (data.parentId !== undefined && data.parentId !== null) {
    const currentCategory = await categoryRepository.findCategoryById(id);
    if (!currentCategory) {
      throw createNotFoundError("Category not found");
    }

    const hasCircularRef = await categoryRepository.checkCircularReference(
      id,
      data.parentId,
    );
    if (hasCircularRef) {
      throw createValidationError(
        "Cannot set a parent that would create a circular reference",
        [
          {
            field: "parentId",
            message: "Circular reference detected in category hierarchy",
          },
        ],
      );
    }
  }

  const updated = await categoryRepository.updateCategory(id, {
    name: data.name || undefined,
    slug: data.slug || undefined,
    description:
      data.description !== undefined ? data.description || null : undefined,
    imageUrl: data.imageUrl !== undefined ? data.imageUrl || null : undefined,
    parentId: data.parentId !== undefined ? data.parentId || null : undefined,
  } as Parameters<typeof categoryRepository.updateCategory>[1]);

  return updated as CategoryType;
};

const deleteCategory = async (id: string): Promise<{ id: string }> => {
  const existing = await categoryRepository.findCategoryWithChildren(id);

  if (!existing) {
    throw createNotFoundError("Category not found");
  }

  if (existing.children.length > 0) {
    throw createValidationError("Cannot delete category with sub-categories", [
      {
        field: "id",
        message: "Remove sub-categories before deleting this category",
      },
    ]);
  }

  await categoryRepository.deleteCategory(id);

  return { id };
};

const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    const urlWithoutQuery = url.split("?")[0];
    const segments = urlWithoutQuery.split("/upload/");
    if (segments.length < 2) return null;
    const pathAfterUpload = segments[segments.length - 1];
    const filenameMatches = pathAfterUpload.match(
      /marketplace\/categories\/([^/]+)$/,
    );
    if (filenameMatches) {
      return `marketplace/categories/${filenameMatches[1]}`;
    }
    return pathAfterUpload.replace(/\.[^.]+$/, "");
  } catch {
    return null;
  }
};

const uploadCategoryImage = async (
  id: string,
  file: File,
): Promise<CategoryType> => {
  const existing = await categoryRepository.findCategoryById(id);

  if (!existing) {
    throw createNotFoundError("Category not found");
  }

  if (existing.imageUrl) {
    throw createValidationError(
      "Category already has an image. Delete it first before uploading a new one.",
      [
        {
          field: "imageUrl",
          message: "Image already exists. Use DELETE to remove it first.",
        },
      ],
    );
  }

  const result = await uploadImage(file, "marketplace/categories");

  const updated = await categoryRepository.uploadCategoryImage(id, result.url);

  return updated as unknown as CategoryType;
};

const deleteCategoryImage = async (id: string): Promise<CategoryType> => {
  const existing = await categoryRepository.findCategoryWithChildren(id);

  if (!existing) {
    throw createNotFoundError("Category not found");
  }

  if (!existing.imageUrl) {
    throw createValidationError("No image found for this category", [
      {
        field: "imageUrl",
        message: "No image to delete",
      },
    ]);
  }

  const publicId = extractPublicIdFromUrl(existing.imageUrl);

  if (publicId) {
    try {
      await deleteImage(publicId);
    } catch (error) {
      console.error("Failed to delete image from Cloudinary:", error);
    }
  }

  await categoryRepository.deleteCategoryImageRecord(id);

  return {
    ...(existing as unknown as CategoryType),
    imageUrl: null,
  };
};

export const categoryService = {
  slugify,
  generateUniqueSlug,
  listCategories,
  listAllCategories,
  getCategoryById,
  getCategoryBySlug,
  getCategoryTree,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  deleteCategoryImage,
};
