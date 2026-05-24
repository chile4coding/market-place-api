import { Role, Currency } from "@/types";
import { ProductImageType } from "./productImage.types";

export type CurrencyWithDefault = Currency | "NGN";

export interface CreateProductParams {
  sellerId: string;
  title: string;
  description?: string;
  price: number;
  currency?: string;
  stock: number;
  categoryId?: string;
  status?: "DRAFT" | "ACTIVE" | "INACTIVE";
  slug?: string;
}

export interface UpdateProductParams {
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  stock?: number;
  categoryId?: string;
  status?: "DRAFT" | "ACTIVE" | "INACTIVE" | "DELETED";
  slug?: string;
}

export interface ProductFilters {
  categoryId?: string;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  status?: "DRAFT" | "ACTIVE" | "INACTIVE" | "DELETED";
  search?: string;
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  sortBy?: "price" | "createdAt" | "title";
  order?: "asc" | "desc";
  filters?: ProductFilters;
}

export interface ProductWithDetails {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  stock: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  sellerId: string;
  categoryId: string | null;
  seller: {
    id: string;
    email: string;
    role: Role;
    profile?: {
      firstName: string | null;
      lastName: string | null;
      avatarUrl: string | null;
    } | null;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  images: ProductImageType[];
  reviews?: {
    _count: { id: number };
    _avg: { rating: number | null };
  };
}

export type ProductStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "DELETED";
