export interface CategoryType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  children?: CategoryType[];
}

export interface CreateCategoryParams {
  name: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
}

export interface UpdateCategoryParams {
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
}

export interface CategoryWithChildren extends CategoryType {
  children: CategoryWithChildren[];
}
