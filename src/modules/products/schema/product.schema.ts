import { ALLOWED_CURRENCIES } from "@/utils/helper";
import { z } from "zod";


export const currencySchema = z
  .enum(ALLOWED_CURRENCIES, {
    errorMap: () => ({ message: `Invalid currency. Allowed: ${ALLOWED_CURRENCIES.join(", ")}` }),
  })
  .optional()
  .default("NGN");

export const createProductSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title must not exceed 255 characters"),
  description: z
    .string()
    .max(5000, "Description must not exceed 5000 characters")
    .optional(),
  price: z
    .number({ invalid_type_error: "Price must be a number" })
    .positive("Price must be greater than 0")
    .refine(
      (val) => val <= 99999999.99,
      "Price must not exceed 99999999.99",
    ),
  currency: currencySchema,
  stock: z
    .number({ invalid_type_error: "Stock must be a number" })
    .int("Stock must be an integer")
    .nonnegative("Stock must be 0 or greater"),
  categoryId: z.string().uuid("Invalid category UUID").optional().nullable(),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]).optional().default("DRAFT"),
});

export const updateProductSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title must not exceed 255 characters")
    .optional(),
  description: z
    .string()
    .max(5000, "Description must not exceed 5000 characters")
    .optional()
    .nullable(),
  price: z
    .number({ invalid_type_error: "Price must be a number" })
    .positive("Price must be greater than 0")
    .refine(
      (val) => val <= 99999999.99,
      "Price must not exceed 99999999.99",
    )
    .optional(),
  currency: currencySchema,
  stock: z
    .number({ invalid_type_error: "Stock must be a number" })
    .int("Stock must be an integer")
    .nonnegative("Stock must be 0 or greater")
    .optional(),
  categoryId: z
    .string()
    .uuid("Invalid category UUID")
    .optional()
    .nullable(),
  status: z
    .enum(["DRAFT", "ACTIVE", "INACTIVE", "DELETED"])
    .optional(),
});

export const productFiltersSchema = z.object({
  categoryId: z.string().uuid("Invalid category UUID").optional(),
  sellerId: z.string().uuid("Invalid seller UUID").optional(),
  minPrice: z
    .number({ invalid_type_error: "minPrice must be a number" })
    .positive("minPrice must be positive")
    .optional(),
  maxPrice: z
    .number({ invalid_type_error: "maxPrice must be a number" })
    .positive("maxPrice must be positive")
    .optional(),
  currency: currencySchema,
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE", "DELETED"]).optional(),
  search: z.string().max(255).optional(),
  page: z
    .number({ invalid_type_error: "page must be a number" })
    .int("page must be an integer")
    .positive("page must be positive")
    .optional()
    .default(1),
  limit: z
    .number({ invalid_type_error: "limit must be a number" })
    .int("limit must be an integer")
    .positive("limit must be positive")
    .max(50, "limit must not exceed 50")
    .optional()
    .default(10),
  sortBy: z.enum(["price", "createdAt", "title"]).optional().default("createdAt"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductFiltersInput = z.infer<typeof productFiltersSchema>;
