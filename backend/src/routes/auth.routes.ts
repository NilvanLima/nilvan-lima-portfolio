import type { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { registerSchema, loginSchema } from "../schemas/auth.schema";

const prisma = new PrismaClient();

export default async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", {
    config: { rateLimit: { max: 5, timeWindow: "1 minute" }},
    schema: {
      tags: ["auth"],
      summary: "Cria um novo usuário",
      body: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string" },
          email: { type: "string" },
          password: { type: "string" },
        },
      },
    },
    handler: async (request, reply) => {
      const parsed = registerSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ message: "Dados inválidos", errors: parsed.error.flatten() });
      }
      const { name, email, password } = parsed.data;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return reply.code(409).send({ message: "E-mail já cadastrado" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { name, email, passwordHash },
      });
      await prisma.cart.create({ data: { userId: user.id } });

      const token = app.jwt.sign({ id: user.id, email: user.email });
      return reply.code(201).send({
        user: { id: user.id, name: user.name, email: user.email },
        token,
      });
    },
  });

  app.post("/auth/login", {
    config: { rateLimit: { max: 5, timeWindow: "1 minute" }},
    schema: {
      tags: ["auth"],
      summary: "Autentica um usuário e retorna um JWT",
      body: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string" },
          password: { type: "string" },
        },
      },
    },
    handler: async (request, reply) => {
      const parsed = loginSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ message: "Dados inválidos", errors: parsed.error.flatten() });
      }
      const { email, password } = parsed.data;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return reply.code(401).send({ message: "Credenciais inválidas" });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return reply.code(401).send({ message: "Credenciais inválidas" });
      }

      const token = app.jwt.sign({ id: user.id, email: user.email });
      return reply.send({
        user: { id: user.id, name: user.name, email: user.email },
        token,
      });
    },
  });
}
