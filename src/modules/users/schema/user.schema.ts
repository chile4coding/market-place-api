import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  phone: z.string().max(20).optional(),
});

export const uploadAvatarSchema = z.object({
  image: z.string().min(1, 'Image is required'),
});

export const createAddressSchema = z.object({
  street: z.string().max(255),
  city: z.string().max(100),
  state: z.string().max(100),
  country: z.string().max(100),
  postalCode: z.string().max(20),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = z.object({
  street: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  isDefault: z.boolean().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UploadAvatarInput = z.infer<typeof uploadAvatarSchema>;
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
