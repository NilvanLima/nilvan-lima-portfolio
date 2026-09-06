import type { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { createProductSchema, listProductsQuerySchema } from "../schemas/product.schema";

const prisma = new PrismaClient();

export default async function productRoutes(app: FastifyInstance) {
  app.get("/products", {
    schema: {
      tags: ["products"],
      summary: "Lista produtos com filtro de categoria/busca e paginação",
    },
    handler: async (request, reply) => {
      const parsed = listProductsQuerySchema.safeParse(request.query);
      if (!parsed.success) {
        return reply.code(400).send({ message: "Parâmetros inválidos", errors: parsed.error.flatten() });
      }
      const { category, search, page, pageSize } = parsed.data;

      const where = {
        ...(category ? { category } : {}),
        ...(search
          ? { name: { contains: search } }
          : {}),
      };

      const [items, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: "desc" },
        }),
        prisma.product.count({ where }),
      ]);

      return reply.send({
        items,
        pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
      });
    },
  });

  app.get("/products/:id", {
    schema: { tags: ["products"], summary: "Detalhe de um produto" },
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) {
        return reply.code(404).send({ message: "Produto não encontrado" });
      }
      return reply.send(product);
    },
  });

  // Rota administrativa simples para popular/gerenciar produtos nos testes.
  app.post("/products", {
    schema: { tags: ["products"], summary: "Cria um produto (uso administrativo/testes)" },
    handler: async (request, reply) => {
      const parsed = createProductSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ message: "Dados inválidos", errors: parsed.error.flatten() });
      }
      const product = await prisma.product.create({ data: parsed.data });
      return reply.code(201).send(product);
    },
  });
}
