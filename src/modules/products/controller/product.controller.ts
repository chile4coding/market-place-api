import { Request, Response, NextFunction } from "express";
import { prisma } from "@/config/database";
import { productService } from "../service/product.service";
import { ApiResponse } from "@/types";
import { File } from "formidable";
import { uploadImage, deleteImage, getSignedUrl } from "@/config/cloudinary";
import {
  createForbiddenError,
  createNotFoundError,
} from "@/utils/AppError";
import {
  ProductListParams,
} from "../types/product.types";

const listProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await productService.listProducts(
      req.query as unknown as ProductListParams,
    );

    const response: ApiResponse = {
      success: true,
      data: result.products,
      ...result.pagination,
    };

    res.json(response);
  } catch (error) {
    next(error as Error);
  }
};

const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { q } = req.query;
    const result = await productService.searchProducts(
      q as string,
      req.query as unknown as ProductListParams,
    );

    const response: ApiResponse = {
      success: true,
      data: result.products,
      ...result.pagination,
    };

    res.json(response);
  } catch (error) {
    next(error as Error);
  }
};

const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    const response: ApiResponse = {
      success: true,
      data: product,
    };

    res.json(response);
  } catch (error) {
    next(error as Error);
  }
};

const getProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug } = req.params;
    const product = await productService.getProductBySlug(slug);

    const response: ApiResponse = {
      success: true,
      data: product,
    };

    res.json(response);
  } catch (error) {
    next(error as Error);
  }
};

const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user!;
    const product = await productService.createProduct(user.id, req.body);

    const response: ApiResponse = {
      success: true,
      data: product,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error as Error);
  }
};

const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const product = await productService.updateProduct(id, user.id, req.body);

    const response: ApiResponse = {
      success: true,
      data: product,
    };

    res.json(response);
  } catch (error) {
    next(error as Error);
  }
};

const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const result = await productService.deleteProduct(id, user.id);

    const response: ApiResponse = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error as Error);
  }
};

const uploadProductImages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const rawFiles = (req.files as { images?: File[] })?.images;

    
    const images: File[] = Array.isArray(rawFiles)
      ? rawFiles
      : rawFiles
        ? [rawFiles]
        : [];

        console.log("this is the images: " ,  images)

    if (images.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "At least one image is required" },
      });
    }

    const product = await productService.getProductById(id);

    if (product.sellerId !== user.id) {
      return next(
        createForbiddenError(
          "Not authorized to upload images for this product",
        ),
      );
    }

    const parseArray = (
      value: string | string[] | undefined,
    ): string[] => {
      if (!value) return [];
      return Array.isArray(value) ? value : [value];
    };

    console.log("this is the req  body: " ,  req.fields)

    const isPrimaryEntries = parseArray(req.body.isPrimary as string | string[] | undefined);
    const sortOrderEntries = parseArray(req.body.sortOrder as string | string[] | undefined);

    const uploadedImages: {
      url: string;
      isPrimary: boolean;
      sortOrder: number;
    }[] = [];

    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const result = await uploadImage(file, `marketplace/products/${id}`);

      const isPrimary = isPrimaryEntries[i]
        ? isPrimaryEntries[i] === "true"
        : i === 0;
      const sortOrder = parseInt(sortOrderEntries[i] || String(i), 10) || i;

      uploadedImages.push({
        url: result.url,
        isPrimary,
        sortOrder,
      });
    }

    if (uploadedImages.some((img) => img.isPrimary)) {
      await prisma.productImage.updateMany({
        where: { productId: id, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const createdImages = await Promise.all(
      uploadedImages.map((img) =>
        prisma.productImage.create({
          data: {
            productId: id,
            url: img.url,
            isPrimary: img.isPrimary,
            sortOrder: img.sortOrder,
          },
        }),
      ),
    );

    const response: ApiResponse = {
      success: true,
      data: createdImages,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error as Error);
  }
};

const getSellerProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user!;
    const { status } = req.query;
    const products = await productService.getSellerProducts(
      user.id,
      status as string | undefined,
    );

    const response: ApiResponse = {
      success: true,
      data: products,
    };

    res.json(response);
  } catch (error) {
    next(error as Error);
  }
};

const getSellerProductStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user!;
    const stats = await productService.getSellerProductStats(user.id);

    const response: ApiResponse = {
      success: true,
      data: stats,
    };

    res.json(response);
  } catch (error) {
    next(error as Error);
  }
};

const deleteProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user!;
    const { productId, imageId } = req.params;

    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
      include: { product: true },
    });

    if (!image) {
      return next(createNotFoundError("Image not found"));
    }

    if (image.product.sellerId !== user.id) {
      return next(
        createForbiddenError(
          "Not authorized to delete this image",
        ),
      );
    }

    try {
      await deleteImage(image.url);
    } catch (error) {
      console.error("Failed to delete image from Cloudinary:", error);
    }

    await prisma.productImage.delete({ where: { id: imageId } });

    const response: ApiResponse = {
      success: true,
      data: { message: "Image deleted successfully" },
    };

    res.json(response);
  } catch (error) {
    next(error as Error);
  }
};

const setPrimaryImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user!;
    const { productId, imageId } = req.params;

    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
      include: { product: true },
    });

    if (!image) {
      return next(createNotFoundError("Image not found"));
    }

    if (image.product.sellerId !== user.id) {
      return next(
        createForbiddenError(
          "Not authorized to modify this image",
        ),
      );
    }

    await prisma.$transaction([
      prisma.productImage.updateMany({
        where: { productId, isPrimary: true },
        data: { isPrimary: false },
      }),
      prisma.productImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      }),
    ]);

    const updatedImage = await prisma.productImage.findUnique({
      where: { id: imageId },
    });

    const response: ApiResponse = {
      success: true,
      data: updatedImage,
    };

    res.json(response);
  } catch (error) {
    next(error as Error);
  }
};

export const productController = {
  listProducts,
  searchProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  getSellerProducts,
  getSellerProductStats,
  deleteProductImage,
  setPrimaryImage,
};
