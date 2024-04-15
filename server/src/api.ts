import { Elysia } from "elysia";
import { instagramTemplate } from "./sns/instagram/template";
import { sharpUtils } from "./sharp";
import { env } from "./env";
import { instagram } from "./sns/instagram";
import { s3 } from "./s3";
import { ngrokUtils } from "./ngrok";
import { convertToRomaji } from "./service/memberNameConverters";

export const api = new Elysia({ prefix: "/api" })
  .group("/posts", (router) =>
    router.post("/", async ({ request }) => {
      const formData = await request.formData();
      const member = formData.get("member") as string
      const youtubeUrl = formData.get("youtubeUrl") as string
      const title = formData.get("title") as string
      const tagPosition = formData.get("tagPosition") as string
      const firstPostImage = formData.get("firstPostImage") as File | null
      const secondCompositeImage = formData.get("secondCompositeImage") as File | null
      const screenshot = formData.get("screenshot") as File | null
      if (!firstPostImage || !secondCompositeImage || !screenshot) {
        return { message: "image1 and image2 are required" }
      }
      
      const instagramPostText = await instagramTemplate.post(member, title, youtubeUrl)
      
      const screenshotOutputPath = env.OUTPUT_PATH !== undefined
        ? `${env.OUTPUT_PATH}/${member}スクショ/${member}_${title}.jpeg`
        : `../output/${member}_${title}_スクショ.jpeg`;
      await sharpUtils.saveImage(screenshot, screenshotOutputPath)

      const removeFrameImage1OutputPath = env.OUTPUT_PATH !== undefined
        ? `${env.OUTPUT_PATH}/${member}画像/${member}_${title}.jpeg`
        : `../output/${member}_${title}_画像.jpeg`;
      await sharpUtils.removeFrame(secondCompositeImage, removeFrameImage1OutputPath)

      const firstPostImageEndPath = `complete/${convertToRomaji(member)}_${encodeURIComponent(title)}_1.jpeg`
      const firstPostImageLocalEndPath = `完成/${member}_${title}_1.jpeg`;
      const firstPostImageOutputPath = env.OUTPUT_PATH !== undefined
        ? `${env.OUTPUT_PATH}/${firstPostImageLocalEndPath}`
        : `../output/${member}_${title}_1.jpeg`;
      await sharpUtils.saveImage(firstPostImage, firstPostImageOutputPath)
      const firstPostImageBuffer = Buffer.from(await firstPostImage.arrayBuffer());
      await s3.upload(firstPostImageEndPath, firstPostImageBuffer)

      const mergeImagesEndPath = `complete/${convertToRomaji(member)}_${encodeURIComponent(title)}_2.jpeg`
      const mergeImagesLocalEndPath = `完成/${member}_${title}_2.jpeg`;
      const mergeImagesOutputPath = env.OUTPUT_PATH !== undefined 
        ? `${env.OUTPUT_PATH}/${mergeImagesLocalEndPath}`
        : `../output/${member}_${title}_2.jpeg`;
      const secondPostImageBuffer = await sharpUtils.mergeImages(removeFrameImage1OutputPath, screenshot, mergeImagesOutputPath)
      await s3.upload(mergeImagesEndPath, secondPostImageBuffer)

      let s3Endpoint = env.S3_ENDPOINT
      const url = new URL(s3Endpoint);
      const isLocalhost = url.href.startsWith('http://localhost:')
      if (isLocalhost) {
        s3Endpoint = await ngrokUtils.start()
      }
      const contenaIds = await instagram.makeContena(member, tagPosition, s3Endpoint, firstPostImageEndPath, mergeImagesEndPath)
      if(contenaIds === null) return
      const groupContenaId = await instagram.makeGroupContena(contenaIds, instagramPostText)
      if(groupContenaId === null) return
      const data = await instagram.contentPublish(groupContenaId)
      if(data === null) return
      console.log("自動投稿に成功しました！")

      return instagramPostText
    }
  ));
