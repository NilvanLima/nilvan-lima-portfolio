import fastifyPlugin from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import type {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";

declare module "@fastify/jwt" {
    interface FastifyJWT {
        payload: { id: string; email: string };
        user: { id: string; email: string };
    }
}

declare module "fastify" {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}

export default fastifyPlugin(async function authPlugin(app: FastifyInstance) {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error(
            "JWT_SECRET não definido. Configure essa variável de ambiente antes de subir a aplicação " +
            "(veja .env.example) — nunca use um valor padrão hardcoded em código versionado.",
        );
    }

    app.register(fastifyJwt, {
        secret: jwtSecret,
        sign: {expiresIn: "2h"},
    });

    app.decorate("authenticate", async function (request: FastifyRequest, reply: FastifyReply) {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.code(401).send({message: "Token ausente, inválido ou expirado"});
        }
    });
});