import { Elysia } from "elysia";
import { instagramTemplate } from "./sns/instagram/template";
import { env } from "./env";
import { MemberName, getFolderPrefix, getUnitName, parseMembersData } from "./service/memberName";
import { TagPosition } from "./service/TagPosition";
import { path } from "./service/path";
import { instagram } from "./sns/instagram";
import { basicAuth } from "elysia-basic-auth";
import { sharpUseCase } from "./sharp/useCase";
import { s3UseCase } from "./s3/useCase";

export interface Member {
  memberName: MemberName | "";
  tagPosition: TagPosition | "";
}

export const api = new Elysia({ prefix: "/api" })
  .group("/login", (router) => {
    router.use(basicAuth({
      users: [{ username: env.USER_NAME, password: env.PASSWORD }],
      realm: 'Secure Area',
      errorMessage: 'Unauthorized',
      noErrorThrown: false
    })), 
    router.post("/", async () => {
      return ({ message: "You are authenticated" });
    })
    return router
  })
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
      
      const folderPrefix = getFolderPrefix(membersData);
      const screenshotOutputPath = path.screenshotOutput(unitName, title, folderPrefix)
      const removeFrameImageOutputPath = path.removeFrameImageOutput(unitName, title, folderPrefix)
      const firstPostImageEndPath = path.firstPostImageEnd(unitName, title)
      const firstPostImageOutputPath = path.firstPostImageOutput(unitName, title)
      const secondPostImageEndPath = path.secondPostImageEnd(unitName, title)
      const secondPostImageOutputPath = path.secondPostImageOutput(unitName, title)

      await sharpUseCase.savePostImage(firstPostImage, screenshot, secondCompositeImage, firstPostImageOutputPath, screenshotOutputPath, removeFrameImageOutputPath)
      await s3UseCase.uploadImages(firstPostImage, screenshot, secondPostImageOutputPath, removeFrameImageOutputPath, firstPostImageEndPath, secondPostImageEndPath)

      // S3_ENDPOINTがlocalhostの場合、ngrokを起動する
      await s3UseCase.checkEndpoint()

      const instagramPostText = await instagramTemplate.post(membersData, title, youtubeUrl)
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
