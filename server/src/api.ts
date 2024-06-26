import { Elysia } from "elysia";
import { env } from "./env";
import {
  MemberName,
  getFolderPrefix,
  getUnitName,
  parseMembersData,
} from "./service/memberName";
import { TagPosition } from "./service/TagPosition";
import { path } from "./service/path";
import { basicAuth } from "elysia-basic-auth";
import { sharpUseCase } from "./sharp/useCase";
import { s3UseCase } from "./s3/useCase";
import { instagramUseCase } from "./sns/instagram/useCase";
import { match } from "ts-pattern";

export interface Member {
  memberName: MemberName | "";
  tagPosition: TagPosition | "";
}

export interface RGBA {
  r: number;
  g: number;
  b: number;
  alpha: number;
}

export type PostImageCount = 1 | 2;

export type EditImageType = "resizeForInstagram" | "createMockIphone";

export type AuthorNameColor = "black" | "white";

export const api = new Elysia({ prefix: "/api" })
  .group("/login", (router) => {
    router.use(
      basicAuth({
        users: [{ username: env.USER_NAME, password: env.PASSWORD }],
        realm: "Secure Area",
        errorMessage: "Unauthorized",
        noErrorThrown: false,
      }),
    ),
      router.post("", async () => {
        return { message: "You are authenticated" };
      });
    return router;
  })
  .group("/posts", (router) =>
    router.post("", async ({ request, set }) => {
      const formData = await request.formData();
      const youtubeUrl = formData.get("youtubeUrl") as string;
      const title = formData.get("title") as string;
      const additionalHashTag = formData.get("additionalHashTag") as
        | string
        | null;
      const membersData = parseMembersData(formData);
      const unitName = getUnitName(membersData);
      const postImageCount = parseInt(
        formData.get("postImageCount") as string,
      ) as PostImageCount;

      const firstPostImage = formData.get("firstPostImage") as File | null;
      let secondCompositeImage: File | null = null;
      let screenshot: File | null = null;
      switch (postImageCount) {
        case 1:
          if (!firstPostImage) {
            set.status = 400;
            throw new Error("image1 is required");
          }
          break;
        case 2:
          secondCompositeImage = formData.get(
            "secondCompositeImage",
          ) as File | null;
          screenshot = formData.get("screenshot") as File | null;
          if (!firstPostImage || !secondCompositeImage || !screenshot) {
            set.status = 400;
            throw new Error("image1, image2, screenshot are required");
          }
          break;
        default:
          set.status = 400;
          throw new Error("postImageCount is invalid");
      }

      const folderPrefix = getFolderPrefix(membersData);
      const paths = path.getPaths(unitName, title, folderPrefix);
      await sharpUseCase.savePostImage(
        firstPostImage,
        screenshot,
        secondCompositeImage,
        paths.firstPostImageOutput,
        paths.screenshotOutput,
        paths.removeFrameImageOutput,
      );
      await s3UseCase.uploadImages(
        firstPostImage,
        screenshot,
        paths.secondPostImageOutput,
        paths.removeFrameImageOutput,
        paths.firstPostImageEnd,
        paths.secondPostImageEnd,
      );

      // S3_ENDPOINTがlocalhostの場合、ngrokを起動する
      await s3UseCase.checkEndpoint();
      const postResult = await instagramUseCase.makePost(
        membersData,
        title,
        youtubeUrl,
        additionalHashTag,
        paths.firstPostImageEnd,
        paths.secondPostImageEnd,
        postImageCount,
      );

      if (!postResult) return;
      return postResult.postText;
    }),
  )
  .group("/edit", (router) => {
    router.post("", async ({ request, set }) => {
      const formData = await request.formData();
      const image = formData.get("image") as File | null;
      const editImageType = formData.get("editImageType") as EditImageType;
      if (!image) {
        set.status = 400;
        throw new Error("image1 is required");
      }

      const output = await match(editImageType)
        .with("resizeForInstagram", async () => {
          return await sharpUseCase.editImage(image);
        })
        .with("createMockIphone", async () => {
          const backgroundRGBAValue = formData.get("backgroundRGBA");
          const authorNameColor = formData.get(
            "authorNameColor",
          ) as AuthorNameColor;
          if (typeof backgroundRGBAValue !== "string") {
            set.status = 400;
            throw new Error("backgroundRGBA is required and must be a string");
          }
          const backgroundRGBA: RGBA = JSON.parse(backgroundRGBAValue);
          return await sharpUseCase.createMockIphoneHomeImage(
            image,
            backgroundRGBA,
            authorNameColor,
          );
        })
        .run();
      return `data:image/jpeg;base64,${output.toString("base64")}`;
    });
    return router;
  });
