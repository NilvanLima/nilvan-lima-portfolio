import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  price: z.number().positive("Preço deve ser maior que zero"),
  imageUrl: z.string().url().optional(),
  stock: z.number().int().nonnegative().default(0),
  category: z.string().min(2),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;

export const listProductsQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
