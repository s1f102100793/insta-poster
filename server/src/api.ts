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
      const firstPostImage = formData.get("firstPostImage") as File | null
      const secondCompositeImage = formData.get("secondCompositeImage") as File | null
      const screenshot = formData.get("screenshot") as File | null
      if (!firstPostImage || !secondCompositeImage || !screenshot) {
        return { message: "image1 and image2 are required" }
      }
      
      const instagramPostText = await instagramTemplate.post(member, title, youtubeUrl)
      console.log(instagramPostText)
      
      const screenshotOutputPath = env.OUTPUT_PATH !== undefined
        ? `${env.OUTPUT_PATH}/${member}スクショ/${member}_${title}.png`
        : `../output/${member}_${title}_スクショ.png`;
      await sharpUtils.saveImage(screenshot, screenshotOutputPath)

      const removeFrameImage1OutputPath = env.OUTPUT_PATH !== undefined
        ? `${env.OUTPUT_PATH}/${member}画像/${member}_${title}.png`
        : `../output/${member}_${title}_画像.png`;
      await sharpUtils.removeFrame(secondCompositeImage, removeFrameImage1OutputPath)

      const firstPostImageOutputPath = env.OUTPUT_PATH !== undefined
        ? `${env.OUTPUT_PATH}/完成/${member}_${title}_1.png`
        : `../output/${member}_${title}_1.png`;
      await sharpUtils.saveImage(firstPostImage, firstPostImageOutputPath)

      const mergeImagesOutputPath = env.OUTPUT_PATH !== undefined 
        ? `${env.OUTPUT_PATH}/完成/${member}_${title}_2.png`
        : `../output/${member}_${title}_2.png`;
      await sharpUtils.mergeImages(removeFrameImage1OutputPath, screenshot, mergeImagesOutputPath)
    }
  ));
