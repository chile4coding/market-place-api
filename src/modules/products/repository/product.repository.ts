import { prisma } from "@/config/database";
import {
  ProductFilters,
  ProductListParams,
  CreateProductParams,
  UpdateProductParams,
} from "../types/product.types";

const buildWhereClause = (filters?: ProductFilters) => {
  if (!filters) return {};

  const where: Record<string, unknown> = {};

  if (filters.sellerId) {
    where.sellerId = filters.sellerId;
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) {
      (where.price as Record<string, number>).gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      (where.price as Record<string, number>).lte = filters.maxPrice;
    }
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
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

const findProductById = async (id: string) => {
  return prisma.product.findUnique({
    where: { id },
    include: {
      seller: {
        include: {
          profile: true,
        },
      },
      category: true,
      images: {
        orderBy: { sortOrder: "asc" },
      },
      reviews: {
        select: {
          rating: true,
        },
      },
    },
  });
};

const findProductBySlug = async (slug: string) => {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      seller: {
        include: {
          profile: true,
        },
      },
      category: true,
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
};

const findProducts = async (
  params: ProductListParams,
  userId?: string,
) => {
  const page = params.page || 1;
  const limit = Math.min(params.limit || 10, 50);
  const skip = (page - 1) * limit;
  const where = buildWhereClause(params.filters);
  const orderBy = buildOrderBy(params);

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        seller: {
          include: {
            profile: true,
          },
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

const createProduct = async (data: CreateProductParams) => {
  return prisma.product.create({
    data: {
      sellerId: data.sellerId,
      title: data.title,
      slug: (data as any).slug,
      description: data.description,
      price: data.price,
      currency: data.currency || "NGN",
      stock: data.stock,
      categoryId: data.categoryId,
      status: data.status || "DRAFT",
    } as any,
    include: {
      seller: {
        include: {
          profile: true,
        },
      },
      category: true,
      images: true,
    },
  });
};

const updateProduct = async (
  id: string,
  userId: string,
  data: UpdateProductParams,
) => {
  return prisma.product.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      price: data.price,
      currency: data.currency,
      stock: data.stock,
      categoryId: data.categoryId,
      status: data.status,
      ...(data as any).slug ? { slug: (data as any).slug } : {},
    } as any,
    include: {
      seller: {
        include: {
          profile: true,
        },
      },
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
};

const deleteProduct = async (id: string, userId: string) => {
  return prisma.product.update({
    where: { id },
    data: { status: "DELETED" },
  });
};

const hardDeleteProduct = async (id: string, userId: string) => {
  return prisma.product.delete({
    where: { id },
  });
};

const countProductsBySeller = async (sellerId: string) => {
  return prisma.product.count({
    where: { sellerId, status: { not: "DELETED" } },
  });
};

const countActiveProductsBySeller = async (sellerId: string) => {
  return prisma.product.count({
    where: { sellerId, status: "ACTIVE" },
  });
};

export const productRepository = {
  findProductById,
  findProductBySlug,
  findProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  hardDeleteProduct,
  countProductsBySeller,
  countActiveProductsBySeller,
};
