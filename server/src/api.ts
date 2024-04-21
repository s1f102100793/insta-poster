import { Elysia } from "elysia";
import { instagramTemplate } from "./sns/instagram/template";
import { sharpUtils } from "./sharp";
import { env } from "./env";
import { s3 } from "./s3";
import { ngrokUtils } from "./ngrok";
import { MemberName, getFolderPrefix, getUnitName, parseMembersData } from "./service/memberName";
import { TagPosition } from "./service/TagPosition";
import { path } from "./service/path";
import { instagram } from "./sns/instagram";

export interface Member {
  memberName: MemberName | "";
  tagPosition: TagPosition | "";
}

export const api = new Elysia({ prefix: "/api" })
  .group("/posts", (router) =>
    router.post("/", async ({ request }) => {
      console.log("スタートしました。")
      const formData = await request.formData();
      const youtubeUrl = formData.get("youtubeUrl") as string
      const title = formData.get("title") as string
      const membersData = parseMembersData(formData);
      const unitName = getUnitName(membersData)
      const firstPostImage = formData.get("firstPostImage") as File | null
      const secondCompositeImage = formData.get("secondCompositeImage") as File | null
      const screenshot = formData.get("screenshot") as File | null
      if (!firstPostImage || !secondCompositeImage || !screenshot) {
        return { message: "image1 and image2 are required" }
      }
      console.log("必須項目が入力されました。")
      
      const instagramPostText = await instagramTemplate.post(membersData, title, youtubeUrl)
      
      const folderPrefix = getFolderPrefix(membersData);
      const screenshotOutputPath = path.screenshotOutput(unitName, title, folderPrefix)
      await sharpUtils.saveImage(screenshot, screenshotOutputPath)
      console.log("スクリーンショットの保存完了しました。")

      const removeFrameImageOutputPath = path.removeFrameImageOutput(unitName, title, folderPrefix)
      await sharpUtils.removeFrame(secondCompositeImage, removeFrameImageOutputPath)
      console.log("フレームの削除完了しました。")

      const firstPostImageEndPath = path.firstPostImageEnd(unitName, title)
      const firstPostImageOutputPath = path.firstPostImageOutput(unitName, title)
      await sharpUtils.saveImage(firstPostImage, firstPostImageOutputPath)
      const firstPostImageBuffer = Buffer.from(await firstPostImage.arrayBuffer());
      await s3.upload(firstPostImageEndPath, firstPostImageBuffer)
      console.log("S3へのアップロード完了しました。")

      const secondPostImageEndPath = path.secondPostImageEnd(unitName, title)
      const secondPostImageOutputPath = path.secondPostImageOutput(unitName, title)
      const secondPostImageBuffer = await sharpUtils.mergeImages(removeFrameImageOutputPath, screenshot, secondPostImageOutputPath)
      console.log("画像のマージ完了しました。")
      await s3.upload(secondPostImageEndPath, secondPostImageBuffer)
      console.log("S3へのアップロード完了しました。")

      let s3Endpoint = env.S3_ENDPOINT
      const url = new URL(s3Endpoint);
      const isLocalhost = url.href.startsWith('http://localhost:')
      if (isLocalhost) {
        s3Endpoint = await ngrokUtils.start()
      }
      const contenaIds = await instagram.makeContena(membersData, firstPostImageEndPath, secondPostImageEndPath)
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
