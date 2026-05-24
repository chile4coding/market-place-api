import { prisma } from "@/config/database";
import { productRepository } from "../repository/product.repository";
import { categoryRepository } from "../repository/category.repository";
import { createNotFoundError, createForbiddenError } from "@/utils/AppError";
import {
  CreateProductParams,
  UpdateProductParams,
  ProductListParams,
  ProductFilters,
} from "../types/product.types";
import { slugify } from "@/utils/helper";

const generateUniqueSlug = async (
  title: string,
  excludeId?: string,
): Promise<string> => {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

const buildProductFilters = (filters?: ProductFilters) => {
  const where: Record<string, unknown> = { status: { not: "DELETED" } };

  if (filters?.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters?.sellerId) {
    where.sellerId = filters.sellerId;
  }

  if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
    where.price = {};
    if (filters?.minPrice !== undefined) {
      (where.price as Record<string, number>).gte = filters.minPrice;
    }
    if (filters?.maxPrice !== undefined) {
      (where.price as Record<string, number>).lte = filters.maxPrice;
    }
  }

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.currency) {
    where.currency = filters.currency;
  }

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" as const } },
      {
        description: {
          contains: filters.search,
          mode: "insensitive" as const,
        },
      },
    ];
  }

  return where;
};

const buildOrderBy = (params?: ProductListParams) => {
  const sortBy = params?.sortBy || "createdAt";
  const order = params?.order || "desc";

  switch (sortBy) {
    case "price":
      return { price: order };
    case "title":
      return { title: order };
    case "createdAt":
    default:
      return { createdAt: order };
  }
};

const listProducts = async (
  params: ProductListParams,
): Promise<{
  products: unknown[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> => {
  const page = params.page || 1;
  const limit = Math.min(params.limit || 10, 50);
  const skip = (page - 1) * limit;
  const where = buildProductFilters(params.filters);
  const orderBy = buildOrderBy(params);

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        seller: {
          include: { profile: true },
        },
        category: true,
        images: {
          take: 1,
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const productsWithStats = await Promise.all(
    products.map(async (product) => {
      const reviews = await prisma.review.findMany({
        where: { productId: product.id },
        select: { rating: true },
      });

      const reviewCount = reviews.length;
      const avgRating =
        reviewCount > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
          : null;

      return {
        ...product,
        _count: { reviews: reviewCount },
        _avg: { rating: avgRating },
      };
    }),
  );

  return {
    products: productsWithStats,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const searchProducts = async (
  searchQuery: string,
  params: ProductListParams,
): Promise<{
  products: unknown[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> => {
  const filters: ProductFilters = {
    ...(params.filters || {}),
    search: searchQuery,
  };
  return listProducts({ ...params, filters });
};

const getProductById = async (id: string) => {
  const product = await productRepository.findProductById(id);

  if (!product) {
    throw createNotFoundError("Product not found");
  }

  return product;
};

const getProductBySlug = async (slug: string) => {
  const product = await productRepository.findProductBySlug(slug);

  if (!product) {
    throw createNotFoundError("Product not found");
  }

  return product;
};

const createProduct = async (sellerId: string, data: CreateProductParams) => {
  if (data.categoryId) {
    const category = await categoryRepository.findCategoryById(data.categoryId);
    if (!category) {
      throw createNotFoundError("Category not found");
    }
  }

  const slug = await generateUniqueSlug(data.title);

  const product = await productRepository.createProduct({
    sellerId: sellerId,
    title: data.title,
    description: data.description,
    price: data.price,
    currency: data.currency || "NGN",
    stock: data.stock,
    categoryId: data.categoryId,
    status: data.status || "DRAFT",
    slug,
  });

  return product;
};

const updateProduct = async (
  id: string,
  userId: string,
  data: UpdateProductParams,
) => {
  const existingProduct = await productRepository.findProductById(id);

  if (!existingProduct) {
    throw createNotFoundError("Product not found");
  }

  if (existingProduct.sellerId !== userId) {
    throw createForbiddenError("Not authorized to update this product");
  }

  if (data.categoryId) {
    const category = await categoryRepository.findCategoryById(data.categoryId);
    if (!category) {
      throw createNotFoundError("Category not found");
    }
  }

  const updateData: Record<string, unknown> = { ...data };

  if (data.title && data.title !== existingProduct.title) {
    updateData.title = data.title;
    updateData.slug = await generateUniqueSlug(data.title, id);
  }

  const product = await productRepository.updateProduct(
    id,
    userId,
    updateData as any,
  );

  return product;
};

const deleteProduct = async (id: string, userId: string) => {
  const existingProduct = await productRepository.findProductById(id);

  if (!existingProduct) {
    throw createNotFoundError("Product not found");
  }

  if (existingProduct.sellerId !== userId) {
    throw createForbiddenError("Not authorized to delete this product");
  }

  await productRepository.deleteProduct(id, userId);

  return { message: "Product deleted successfully" };
};

const getSellerProducts = async (
  sellerId: string,
  status?: string,
): Promise<unknown[]> => {
  const where: Record<string, unknown> = {
    sellerId,
    status: { not: "DELETED" },
  };

  if (status && status !== "undefined") {
    where.status = status;
  }

  return prisma.product.findMany({
    where,
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      _count: { select: { reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getAllProductsForAdmin = async (
  params: ProductListParams,
): Promise<{
  products: unknown[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> => {
  const page = params.page || 1;
  const limit = Math.min(params.limit || 10, 50);
  const skip = (page - 1) * limit;
  const orderBy = buildOrderBy(params);

  const where = params.filters ? buildProductFilters(params.filters) : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        seller: {
          include: { profile: true },
        },
        category: true,
        images: {
          take: 1,
          orderBy: { sortOrder: "asc" },
        },
        _count: { select: { reviews: true, orderItems: true } },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getSellerProductStats = async (sellerId: string) => {
  const [total, active, inactive, draft] = await Promise.all([
    productRepository.countProductsBySeller(sellerId),
    productRepository.countActiveProductsBySeller(sellerId),
    prisma.product.count({ where: { sellerId, status: "INACTIVE" } }),
    prisma.product.count({ where: { sellerId, status: "DRAFT" } }),
  ]);

  return { total, active, inactive, draft };
};

export const productService = {
  slugify,
  generateUniqueSlug,
  listProducts,
  searchProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  getAllProductsForAdmin,
  getSellerProductStats,
};
