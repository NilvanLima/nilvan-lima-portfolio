import type { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { addCartItemSchema, updateCartItemSchema } from "../schemas/cart.schema";

const prisma = new PrismaClient();

export default async function cartRoutes(app: FastifyInstance) {
  app.addHook("onRequest", app.authenticate);

  app.get("/cart", {
    schema: { tags: ["cart"], summary: "Retorna o carrinho do usuário autenticado" },
    handler: async (request, reply) => {
      const userId = request.user.id;
      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } },
      });
      return reply.send(cart);
    },
  });

  app.post("/cart/items", {
    schema: { tags: ["cart"], summary: "Adiciona um item ao carrinho" },
    handler: async (request, reply) => {
      const parsed = addCartItemSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ message: "Dados inválidos", errors: parsed.error.flatten() });
      }
      const { productId, quantity } = parsed.data;
      const userId = request.user.id;

      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) {
        return reply.code(404).send({ message: "Produto não encontrado" });
      }
      if (product.stock < quantity) {
        return reply.code(422).send({ message: "Estoque insuficiente" });
      }

      const cart = await prisma.cart.findUniqueOrThrow({ where: { userId } });

      const item = await prisma.cartItem.upsert({
        where: { cartId_productId: { cartId: cart.id, productId } },
        update: { quantity: { increment: quantity } },
        create: { cartId: cart.id, productId, quantity },
      });

      return reply.code(201).send(item);
    },
  });

  app.patch("/cart/items/:productId", {
    schema: { tags: ["cart"], summary: "Atualiza a quantidade de um item do carrinho" },
    handler: async (request, reply) => {
      const { productId } = request.params as { productId: string };
      const parsed = updateCartItemSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ message: "Dados inválidos", errors: parsed.error.flatten() });
      }
      const userId = request.user.id;
      const cart = await prisma.cart.findUniqueOrThrow({ where: { userId } });

      const item = await prisma.cartItem.update({
        where: { cartId_productId: { cartId: cart.id, productId } },
        data: { quantity: parsed.data.quantity },
      });
      return reply.send(item);
    },
  });

  app.delete("/cart/items/:productId", {
    schema: { tags: ["cart"], summary: "Remove um item do carrinho" },
    handler: async (request, reply) => {
      const { productId } = request.params as { productId: string };
      const userId = request.user.id;
      const cart = await prisma.cart.findUniqueOrThrow({ where: { userId } });

      await prisma.cartItem.delete({
        where: { cartId_productId: { cartId: cart.id, productId } },
      });
      return reply.code(204).send();
    },
  });
}
