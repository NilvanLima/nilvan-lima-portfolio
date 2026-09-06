import type { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function orderRoutes(app: FastifyInstance) {
  app.addHook("onRequest", app.authenticate);

  app.post("/orders", {
    schema: { tags: ["orders"], summary: "Finaliza a compra (checkout) a partir do carrinho atual" },
    handler: async (request, reply) => {
      const userId = request.user.id;

      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } },
      });

      if (!cart || cart.items.length === 0) {
        return reply.code(422).send({ message: "Carrinho vazio" });
      }

      for (const item of cart.items) {
        if (item.product.stock < item.quantity) {
          return reply.code(422).send({
            message: `Estoque insuficiente para o produto "${item.product.name}"`,
          });
        }
      }

      const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

      const order = await prisma.$transaction(async (tx) => {
        const createdOrder = await tx.order.create({
          data: {
            userId,
            total,
            status: "PAID",
            items: {
              create: cart.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.product.price,
              })),
            },
          },
          include: { items: true },
        });

        for (const item of cart.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

        return createdOrder;
      });

      return reply.code(201).send(order);
    },
  });

  app.get("/orders", {
    schema: { tags: ["orders"], summary: "Lista os pedidos do usuário autenticado" },
    handler: async (request, reply) => {
      const userId = request.user.id;
      const orders = await prisma.order.findMany({
        where: { userId },
        include: { items: true },
        orderBy: { createdAt: "desc" },
      });
      return reply.send(orders);
    },
  });

  app.get("/orders/:id", {
    schema: { tags: ["orders"], summary: "Detalhe de um pedido" },
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const userId = request.user.id;
      const order = await prisma.order.findFirst({
        where: { id, userId },
        include: { items: { include: { product: true } } },
      });
      if (!order) {
        return reply.code(404).send({ message: "Pedido não encontrado" });
      }
      return reply.send(order);
    },
  });
}
