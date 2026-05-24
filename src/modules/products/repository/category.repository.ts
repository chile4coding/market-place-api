import { prisma } from "@/config/database";

const findCategoryById = async (id: string) => {
  return prisma.category.findUnique({
    where: { id },
  });
};

const findCategoryBySlug = async (slug: string) => {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      children: {
        orderBy: { name: "asc" },
      },
    },
  });
};
const findCategoryByName = async (name: string) => {
  return prisma.category.findFirst({
    where: { name },
    include: {
      children: {
        orderBy: { name: "asc" },
      },
    },
  });
};

const findCategoryWithChildren = async (id: string) => {
  return prisma.category.findUnique({
    where: { id },
    include: {
      children: {
        where: { parentId: id },
        orderBy: { name: "asc" },
      },
    },
  });
};

const findRootCategories = async () => {
  return prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });
};

const findCategoryTree = async (): Promise<
  Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: { products: number };
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
  }>
> => {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        orderBy: { name: "asc" },
        include: {
          _count: { select: { products: true } },
        },
      },
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });

  return categories.map((cat) => ({
    ...cat,
    children: cat.children.map((child) => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
      description: child.description,
      imageUrl: child.imageUrl,
      createdAt: child.createdAt,
      updatedAt: child.updatedAt,
    })),
  }));
};

const listCategories = async (parentId?: string) => {
  return prisma.category.findMany({
    where: parentId ? { parentId } : {},
    include: {
      children: true,
    },
    orderBy: { name: "asc" },
  });
};

const findAllCategories = async () => {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: { where: { status: "ACTIVE" } } } },
    },
  });
};

const countProductsByCategory = async (categoryId: string) => {
  return prisma.product.count({
    where: { categoryId, status: "ACTIVE" },
  });
};

const uploadCategoryImage = async (id: string, imageUrl: string) => {
  return prisma.category.update({
    where: { id },
    data: { imageUrl },
  });
};

const deleteCategoryImage = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    select: { imageUrl: true },
  });
  return category;
};

const deleteCategoryImageRecord = async (id: string) => {
  return prisma.category.update({
    where: { id },
    data: { imageUrl: null },
  });
};

const createCategory = async (
  data: {
    name: string;
    slug: string;
    description?: string | null;
    imageUrl?: string | null;
    parentId?: string | null;
  },
) => {
  return prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      parentId: data.parentId || null,
    },
  });
};

const updateCategory = async (
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string | null;
    imageUrl?: string | null;
    parentId?: string | null;
  },
) => {
  return prisma.category.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      imageUrl: data.imageUrl,
      parentId: data.parentId,
    },
  });
};

const deleteCategory = async (id: string) => {
  return prisma.category.delete({
    where: { id },
  });
};

const checkCircularReference = async (
  categoryId: string,
  parentId: string,
): Promise<boolean> => {
  if (categoryId === parentId) return true;

  return false;
};

const isSlugUnique = async (slug: string, excludeId?: string): Promise<boolean> => {
  const existing = await prisma.category.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!existing) return true;
  if (excludeId && existing.id === excludeId) return true;
  return false;
};

export const categoryRepository = {
  findCategoryById,
  findCategoryBySlug,
  findCategoryWithChildren,
  findRootCategories,
  findCategoryTree,
  listCategories,
  findAllCategories,
  countProductsByCategory,
  uploadCategoryImage,
  deleteCategoryImage,
  deleteCategoryImageRecord,
  createCategory,
  updateCategory,
  deleteCategory,
  checkCircularReference,
  isSlugUnique,
  findCategoryByName
};
