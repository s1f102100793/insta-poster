import { Elysia } from "elysia";
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
      const screenshot = formData.get("screenshot") as File | null
      if (!image1 || !screenshot) {
        return { message: "image1 and image2 are required" }
      }
      
      const instagramPostText = await instagramTemplate.post(member, title, youtubeUrl)
      console.log(instagramPostText)

      const removeFrameImage1OutputPath = env.OUTPUT_PATH !== undefined
        ? `${env.OUTPUT_PATH}/${member}画像/${member}_${title}.png`
        : `../output/${member}_${title}.png`;
      await sharpUtils.removeFrame(image1, removeFrameImage1OutputPath)

      const mergeImagesOutputPath = env.OUTPUT_PATH !== undefined 
        ? `${env.OUTPUT_PATH}/完成/${member}_${title}_2.png`
        : `../output/${member}_${title}_2.png`;
      await sharpUtils.mergeImages(removeFrameImage1OutputPath, screenshot, mergeImagesOutputPath)
    }
  ));
