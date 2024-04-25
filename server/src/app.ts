import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import staticPlugin from "@elysiajs/static";
import { swagger } from "@elysiajs/swagger";
import { env } from "./env";
import { api } from "./api";
import { basicAuth } from "elysia-basic-auth";

const app = new Elysia()
  .use(cors())
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
  .use(basicAuth({
    users: [{ username: 'admin', password: 'admin' }],
    realm: '',
    errorMessage: 'Unauthorized',
    exclude: ['public/**'],
    noErrorThrown: false,
  }))
  .use(api);

export default app;
