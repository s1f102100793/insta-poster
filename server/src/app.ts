import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import staticPlugin from "@elysiajs/static";
import { swagger } from "@elysiajs/swagger";
import { env } from "./env";
import { api } from "./api";

console.log('CORS_ORIGIN:', env.CORS_ORIGIN);

const app = new Elysia()
  .use(cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }))
  .use(
    swagger({
      documentation: {
        info: {
          title: "Todos API Documentation",
          description: "Elysia BunJS Todos API",
          version: "1.0.0",
        },
        tags: [{ name: "Todos", description: "Todos endpoints" }],
      },
      exclude: ["/"],
    }),
  )
  .get("/", ({ set }) => {
    set.redirect = "/index.html";
  })
  .use(staticPlugin({ prefix: "/", assets: env.PUBLIC_DIR }))
  .use(api);

export default app;
