export interface ProductImageType {
  id: string;
  productId: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface CreateProductImageParams {
  productId: string;
  url: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface UpdateProductImageParams {
  isPrimary?: boolean;
  sortOrder?: number;
}
