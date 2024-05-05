import { Elysia } from "elysia";
import { env } from "./env";
import { MemberName, getFolderPrefix, getUnitName, parseMembersData } from "./service/memberName";
import { TagPosition } from "./service/TagPosition";
import { path } from "./service/path";
import { basicAuth } from "elysia-basic-auth";
import { sharpUseCase } from "./sharp/useCase";
import { s3UseCase } from "./s3/useCase";
import { instagramUseCase } from "./sns/instagram/useCase";

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
      const formData = await request.formData();
      const youtubeUrl = formData.get("youtubeUrl") as string
      const title = formData.get("title") as string
      const additionalHashTag = formData.get("additionalHashTag") as string | null
      const membersData = parseMembersData(formData);
      const unitName = getUnitName(membersData)
      const postImageCount = formData.get("postImageCount") as string

      const firstPostImage = formData.get("firstPostImage") as File | null
      let secondCompositeImage: File | null = null;
      let screenshot: File | null = null;
      if (postImageCount === "一枚") {
        if (!firstPostImage) {
          return { message: "image1 is required" }
        }
      } else {
        secondCompositeImage = formData.get("secondCompositeImage") as File | null
        screenshot = formData.get("screenshot") as File | null
        if (!firstPostImage || !secondCompositeImage || !screenshot) {
          return { message: "image1 and image2 are required" }
        }
      }
      
      const folderPrefix = getFolderPrefix(membersData);
      const paths = path.getPaths(unitName, title, folderPrefix);
      await sharpUseCase.savePostImage(firstPostImage, screenshot, secondCompositeImage, paths.firstPostImageOutput, paths.screenshotOutput, paths.removeFrameImageOutput);
      await s3UseCase.uploadImages(firstPostImage, screenshot, paths.secondPostImageOutput, paths.removeFrameImageOutput, paths.firstPostImageEnd, paths.secondPostImageEnd);

      // S3_ENDPOINTがlocalhostの場合、ngrokを起動する
      await s3UseCase.checkEndpoint()
      const postResult = await instagramUseCase.makePost(membersData, title, youtubeUrl, additionalHashTag, paths.firstPostImageEnd, paths.secondPostImageEnd, postImageCount)  
      
      if (!postResult) return
      return postResult.postText
    }
  ));
