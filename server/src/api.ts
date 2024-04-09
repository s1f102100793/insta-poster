import { Elysia } from "elysia";
import { instagram } from "./sns/instagram";

export const api = new Elysia({ prefix: "/api" })
  .group("/posts", (router) =>
    router.post("/", async ({ request }) => {
      const formData = await request.formData();
      await instagram.getPosts();
    }
  ));
