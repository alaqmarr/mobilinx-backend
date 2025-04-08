// schemas/product.ts
import { z } from 'zod';

export const CoverVariantSchema = z.object({
  phoneModelId: z.string().min(1),
  imageFile: z.instanceof(File).refine(file => file.size > 0, 'Image is required'),
  quantity: z.number().min(0),
  price: z.number().min(0.01)
});

export const CoverProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  brandId: z.string().min(1, "Brand is required"),
  seriesId: z.string().min(1, "Series is required"),
  variants: z.array(CoverVariantSchema).min(1, "At least one variant is required")
});