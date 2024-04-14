import { Elysia } from "elysia";
import { instagramTemplate } from "./sns/instagram/template";
import { sharpUtils } from "./sharp";
import { env } from "./env";
import { instagram } from "./sns/instagram";
import { s3 } from "./s3";
import { ngrokUtils } from "./ngrok";

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
      
      const screenshotOutputPath = env.OUTPUT_PATH !== undefined
        ? `${env.OUTPUT_PATH}/${member}スクショ/${member}_${title}.jpg`
        : `../output/${member}_${title}_スクショ.jpg`;
      await sharpUtils.saveImage(screenshot, screenshotOutputPath)

      const removeFrameImage1OutputPath = env.OUTPUT_PATH !== undefined
        ? `${env.OUTPUT_PATH}/${member}画像/${member}_${title}.jpg`
        : `../output/${member}_${title}_画像.jpg`;
      await sharpUtils.removeFrame(secondCompositeImage, removeFrameImage1OutputPath)

      const firstPostImageEndPath = `完成/${member}_${title}_1.jpg`
      const firstPostImageOutputPath = env.OUTPUT_PATH !== undefined
        ? `${env.OUTPUT_PATH}/${firstPostImageEndPath}`
        : `../output/${member}_${title}_1.jpg`;
      await sharpUtils.saveImage(firstPostImage, firstPostImageOutputPath)
      const firstPostImageBuffer = Buffer.from(await firstPostImage.arrayBuffer());
      await s3.upload(firstPostImageEndPath, firstPostImageBuffer)

      const mergeImagesEndPath = `完成/${member}_${title}_2.jpg`
      const mergeImagesOutputPath = env.OUTPUT_PATH !== undefined 
        ? `${env.OUTPUT_PATH}/${mergeImagesEndPath}`
        : `../output/${member}_${title}_2.jpg`;
      const secondPostImageBuffer = await sharpUtils.mergeImages(removeFrameImage1OutputPath, screenshot, mergeImagesOutputPath)
      await s3.upload(mergeImagesEndPath, secondPostImageBuffer)

      let s3Endpoint = env.S3_ENDPOINT
      const url = new URL(s3Endpoint);
      const isLocalhost = url.href.startsWith('http://localhost:')
      if (isLocalhost) {
        s3Endpoint = await ngrokUtils.start()
      }
      console.log('s3Endpoint:', s3Endpoint)
      const contenaIds = await instagram.makeContenaAPI(s3Endpoint, firstPostImageEndPath, mergeImagesEndPath)
      // await instagram.makeGroupContenaAPI(contenaIds)

      return instagramPostText
    }
  ));
