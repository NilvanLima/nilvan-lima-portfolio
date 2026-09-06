import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z.string().min(1, "productId é obrigatório"),
  quantity: z.number().int().positive().default(1),
});
export type AddCartItemInput = z.infer<typeof addCartItemSchema>;

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive(),
});
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
