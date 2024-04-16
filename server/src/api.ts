import { Elysia } from "elysia";
import { instagramTemplate } from "./sns/instagram/template";
import { sharpUtils } from "./sharp";
import { env } from "./env";
import { instagram } from "./sns/instagram";
import { s3 } from "./s3";
import { ngrokUtils } from "./ngrok";
import { MemberName, convertToRomaji } from "./service/memberNameConverters";
import { TagPosition } from "./sns/instagram/getPositionCoordinates";

export const api = new Elysia({ prefix: "/api" })
  .group("/posts", (router) =>
    router.post("/", async ({ request }) => {
      console.log("スタートしました。")
      const formData = await request.formData();
      const member = formData.get("member") as MemberName
      const youtubeUrl = formData.get("youtubeUrl") as string
      const title = formData.get("title") as string
      const tagPosition = formData.get("tagPosition") as TagPosition
      const firstPostImage = formData.get("firstPostImage") as File | null
      const secondCompositeImage = formData.get("secondCompositeImage") as File | null
      const screenshot = formData.get("screenshot") as File | null
      if (!firstPostImage || !secondCompositeImage || !screenshot) {
        return { message: "image1 and image2 are required" }
      }
      console.log("必須項目が入力されました。")
      
      const instagramPostText = await instagramTemplate.post(member, title, youtubeUrl)
      
      const screenshotOutputPath = env.OUTPUT_PATH !== undefined
        ? `${env.OUTPUT_PATH}/${member}スクショ/${member}_${title}.png`
        : `../output/${member}_${title}_スクショ.png`;
      await sharpUtils.saveImage(screenshot, screenshotOutputPath)
      console.log("スクリーンショットの保存完了しました。")

      const removeFrameImage1OutputPath = env.OUTPUT_PATH !== undefined
        ? `${env.OUTPUT_PATH}/${member}画像/${member}_${title}.png`
        : `../output/${member}_${title}_画像.png`;
      await sharpUtils.removeFrame(secondCompositeImage, removeFrameImage1OutputPath)
      console.log("フレームの削除完了しました。")

      const firstPostImageEndPath = `complete/${convertToRomaji(member)}_${encodeURIComponent(title)}_1.png`
      const firstPostImageLocalEndPath = `完成/${member}_${title}_1.png`;
      const firstPostImageOutputPath = env.OUTPUT_PATH !== undefined
        ? `${env.OUTPUT_PATH}/${firstPostImageLocalEndPath}`
        : `../output/${member}_${title}_1.png`;
      await sharpUtils.saveImage(firstPostImage, firstPostImageOutputPath)
      const firstPostImageBuffer = Buffer.from(await firstPostImage.arrayBuffer());
      await s3.upload(firstPostImageEndPath, firstPostImageBuffer)
      console.log("S3へのアップロード完了しました。")

      const mergeImagesEndPath = `complete/${convertToRomaji(member)}_${encodeURIComponent(title)}_2.png`
      const mergeImagesLocalEndPath = `完成/${member}_${title}_2.png`;
      const mergeImagesOutputPath = env.OUTPUT_PATH !== undefined 
        ? `${env.OUTPUT_PATH}/${mergeImagesLocalEndPath}`
        : `../output/${member}_${title}_2.png`;
      const secondPostImageBuffer = await sharpUtils.mergeImages(removeFrameImage1OutputPath, screenshot, mergeImagesOutputPath)
      console.log("画像のマージ完了しました。")
      await s3.upload(mergeImagesEndPath, secondPostImageBuffer)
      console.log("S3へのアップロード完了しました。")

      let s3Endpoint = env.S3_ENDPOINT
      const url = new URL(s3Endpoint);
      const isLocalhost = url.href.startsWith('http://localhost:')
      if (isLocalhost) {
        s3Endpoint = await ngrokUtils.start()
      }
      const contenaIds = await instagram.makeContena(member, tagPosition, s3Endpoint, firstPostImageEndPath, mergeImagesEndPath)
      if(contenaIds === null) return
      console.log("コンテナの作成完了しました。")
      const groupContenaId = await instagram.makeGroupContena(contenaIds, instagramPostText)
      if(groupContenaId === null) return
      console.log("グループコンテナの作成完了しました。")
      const data = await instagram.contentPublish(groupContenaId)
      if(data === null) return
      console.log("自動投稿に成功しました！")

      return instagramPostText
    }
  ));
