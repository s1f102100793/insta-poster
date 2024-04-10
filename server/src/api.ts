import { Elysia } from "elysia";
import { instagram } from "./sns/instagram";
import { instagramTemplate } from "./sns/instagram/template";

export const api = new Elysia({ prefix: "/api" })
  .group("/posts", (router) =>
    router.post("/", async ({ request }) => {
      const formData = await request.formData();
      const member = formData.get("member") as string
      const youtubeUrl = formData.get("youtubeUrl") as string
      const title = formData.get("title") as string
      const image1 = formData.get("image1")
      const image2 = formData.get("image2")
      
      const instagramPostText = await instagramTemplate.post(member, title, youtubeUrl)
    }
  ));
