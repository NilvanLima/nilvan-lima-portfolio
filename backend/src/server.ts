import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import authPlugin from "./plugins/auth";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import cartRoutes from "./routes/cart.routes";
import orderRoutes from "./routes/order.routes";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";

async function buildServer() {
    const app = Fastify({logger: true});

    await app.register(helmet, {
        contentSecurityPolicy: false,
    });

    await app.register(rateLimit, {
        max: 100,
        timeWindow: "1 minute",
    });

    await app.register(cors, { origin: true });

    await app.register(swagger, {
        openapi: {
            info: {
                title: "E-commerce Playground API",
                description: "API de e-commerce para playground de testes (Cypress, Playwright, k6, testes de API)",
                version: "1.0.0",
            },
        },
    });
    await app.register(swaggerUi, {routePrefix: "/docs"});

    await app.register(authPlugin);

    await app.register(authRoutes);
    await app.register(productRoutes);
    await app.register(cartRoutes);
    await app.register(orderRoutes);

    app.get("/health", async () => ({status: "ok"}));

    return app;
}

async function start() {
    const app = await buildServer();
    const port = Number(process.env.PORT ?? 3333);

    try {
        await app.listen({port, host: "0.0.0.0"});
        app.log.info(`Servidor rodando em http://localhost:${port}`);
        app.log.info(`Documentação Swagger em http://localhost:${port}/docs`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}

start();
