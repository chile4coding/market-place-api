import { Router } from "express";
import { validate } from "@/middleware/validation";
import { authenticate, authorize } from "@/middleware/auth";
import { fileUpload } from "@/middleware/fileUpload";
import {
  createProductSchema,
  updateProductSchema,
  productFiltersSchema,
} from "../schema/product.schema";
import { productController } from "../controller/product.controller";
import { categoryController } from "../controller/category.controller";
import { createCategorySchema, updateCategorySchema } from "../schema/category.schema";

const router = Router();

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: List all products with filters, sorting, and pagination
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, ACTIVE, INACTIVE, DELETED]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price, createdAt, title]
 *           default: createdAt
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get("/", productController.listProducts);

/**
 * @swagger
 * /api/v1/products/search:
 *   get:
 *     summary: Full-text search products by title or description
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *       400:
 *         description: Search query is required
 */
router.get("/search", productController.searchProducts);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get("/:id", productController.getProductById);

/**
 * @swagger
 * /api/v1/products/slug/{slug}:
 *   get:
 *     summary: Get product by slug
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get("/slug/:slug", productController.getProductBySlug);

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Create a new product (Seller or admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *               - stock
 *               - currency
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *               description:
 *                 type: string
 *                 maxLength: 5000
 *               price:
 *                 type: number
 *                 minimum: 0.01
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               status:
 *                 type: string
 *                 enum: [DRAFT, ACTIVE, INACTIVE]
 *               currency:
 *                 type: string
 *                 maxLength: 5
 *     responses:
 *       201:
 *         description: Product created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post(
  "/",
  authenticate,
  authorize("SELLER", "ADMIN"),
  validate(createProductSchema),
  productController.createProduct,
);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   patch:
 *     summary: Partially update a product (Seller owner only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *               description:
 *                 type: string
 *                 maxLength: 5000
 *               price:
 *                 type: number
 *                 minimum: 0.01
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               status:
 *                 type: string
 *                 enum: [DRAFT, ACTIVE, INACTIVE, DELETED]
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to update this product
 *       404:
 *         description: Product not found
 */
router.patch(
  "/:id",
  authenticate,
  authorize("SELLER", "ADMIN"),
  validate(updateProductSchema),
  productController.updateProduct,
);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
 *     summary: Soft delete a product (Seller owner only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to delete this product
 *       404:
 *         description: Product not found
 */
router.delete(
  "/:id",
  authenticate,
  authorize("SELLER", "ADMIN"),
  productController.deleteProduct,
);

/**
 * @swagger
 * /api/v1/products/{id}/images:
 *   post:
 *     summary: Upload images for a product (Seller owner only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               isPrimary:
 *                 type: array
 *                 items:
 *                   type: boolean
 *               sortOrder:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Images uploaded successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized
 */
router.post(
  "/:id/images",
  authenticate,
  authorize("SELLER", "ADMIN"),
  fileUpload,
  productController.uploadProductImages,
);

/**
 * @swagger
 * /api/v1/products/{id}/images:
 *   get:
 *     summary: Get product images
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Images retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get("/:id/images", productController.getSellerProducts);

/**
 * @swagger
 * /api/v1/products/{productId}/images/{imageId}:
 *   delete:
 *     summary: Delete a product image (Seller owner only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Image not found
 */
router.delete(
  "/:productId/images/:imageId",
  authenticate,
  authorize("SELLER", "ADMIN"),
  productController.deleteProductImage,
);

/**
 * @swagger
 * /api/v1/products/{productId}/images/{imageId}/primary:
 *   patch:
 *     summary: Set a product image as primary (Seller owner only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Primary image set successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Image not found
 */
router.patch(
  "/:productId/images/:imageId/primary",
  authenticate,
  authorize("SELLER", "ADMIN"),
  productController.setPrimaryImage,
);

/**
 * @swagger
 * /api/v1/seller/products:
 *   get:
 *     summary: Get the authenticated seller's products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, ACTIVE, INACTIVE, DELETED]
 *     responses:
 *       200:
 *         description: Seller products retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/seller/products",
  authenticate,
  authorize("SELLER", "ADMIN"),
  productController.getSellerProducts,
);

/**
 * @swagger
 * /api/v1/seller/products/stats:
 *   get:
 *     summary: Get statistics about the seller's products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller product stats retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/seller/products/stats",
  authenticate,
  authorize("SELLER", "ADMIN"),
  productController.getSellerProductStats,
);

/**
 * @swagger
 * /api/v1/products/categories/tree:
 *   get:
 *     summary: Get full category tree (root categories with children)
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Category tree retrieved successfully
 */
router.get("/categories/tree", categoryController.getCategoryTree);

/**
 * @swagger
 * /api/v1/products/categories:
 *   get:
 *     summary: List all categories with optional parentId filter
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get("/categories", categoryController.listCategories);

/**
 * @swagger
 * /api/v1/products/categories/all:
 *   get:
 *     summary: List all categories with active product counts
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: All categories retrieved successfully
 */
router.get("/categories/all", categoryController.listAllCategories);

/**
 * @swagger
 * /api/v1/products/categories/{id}:
 *   get:
 *     summary: Get a category by ID (with children)
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *       404:
 *         description: Category not found
 */
router.get("/categories/:id", categoryController.getCategoryById);

/**
 * @swagger
 * /api/v1/products/categories/slug/{slug}:
 *   get:
 *     summary: Get a category by slug (with children)
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *       404:
 *         description: Category not found
 */
router.get("/categories/slug/:slug", categoryController.getCategoryBySlug);

/**
 * @swagger
 * /api/v1/products/categories:
 *   post:
 *     summary: Create a new category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name   
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *               parentId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Category created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post(
  "/categories",
  authenticate,
  authorize("ADMIN"),
  validate(createCategorySchema),
  categoryController.createCategory,
);

/**
 * @swagger
 * /api/v1/products/categories/{id}:
 *   put:
 *     summary: Update a category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               slug:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$'
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *               parentId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Category not found
 *       409:
 *         description: Slug already exists
 */
router.put(
  "/categories/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateCategorySchema),
  categoryController.updateCategory,
);

/**
 * @swagger
 * /api/v1/products/categories/{id}:
 *   delete:
 *     summary: Delete a category (Admin only, no sub-categories)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       400:
 *         description: Category has sub-categories
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Category not found
 */
router.delete(
  "/categories/:id",
  authenticate,
  authorize("ADMIN"),
  categoryController.deleteCategory,
);

/**
 * @swagger
 * /api/v1/products/categories/{id}/image:
 *   post:
 *     summary: Upload an image for a category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Category image uploaded successfully
 *       400:
 *         description: Image file required or category already has an image
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
router.post(
  "/categories/:id/image",
  authenticate,
  authorize("ADMIN"),
  fileUpload,
  categoryController.uploadCategoryImage,
);

/**
 * @swagger
 * /api/v1/products/categories/{id}/image:
 *   delete:
 *     summary: Delete a category's image (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Category image deleted successfully
 *       400:
 *         description: No image found for this category
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
router.delete(
  "/categories/:id/image",
  authenticate,
  authorize("ADMIN"),
  categoryController.deleteCategoryImage,
);

export default router;
