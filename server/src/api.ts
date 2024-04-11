import { Elysia } from "elysia";
import { instagram } from "./sns/instagram";
import { instagramTemplate } from "./sns/instagram/template";
import { sharpUtils } from "./sharp";
import { env } from "./env";

export const api = new Elysia({ prefix: "/api" })
  .group("/posts", (router) =>
    router.post("/", async ({ request }) => {
      const formData = await request.formData();
      const member = formData.get("member") as string
      const youtubeUrl = formData.get("youtubeUrl") as string
      const title = formData.get("title") as string
      const image1 = formData.get("image1") as File | null
      const screenshot = formData.get("image2") as File | null
      
      const instagramPostText = await instagramTemplate.post(member, title, youtubeUrl)
      console.log(instagramPostText)
      if (image1 && screenshot) {
        const outputPath = env.OUTPUT_PATH !== undefined 
          ? `${env.OUTPUT_PATH}/${member}_${title}.png`
          : `../output/${member}_${title}.png`;

        const mergedImage = await sharpUtils.mergeImages(image1, screenshot, outputPath)
        console.log(mergedImage)
      }
    }
  ));
