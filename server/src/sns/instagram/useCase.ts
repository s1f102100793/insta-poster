import { instagram } from ".";
import { Member } from "../../api";
import { instagramTemplate } from "./template";
import { match } from "ts-pattern";

export const instagramUseCase = {
  async makePost(
    membersData: Member[],
    title: string,
    youtubeUrl: string,
    additionalHashTag: string | null,
    firstPostImageEndPath: string,
    secondPostImageEndPath: string,
    postImageCount: string,
  ) {
    const instagramPostText = await instagramTemplate.post(
      membersData,
      title,
      youtubeUrl,
      additionalHashTag,
    );

    return match(postImageCount)
      .with("一枚", async () => {
        const contenaId = await instagram.singlePostMakeContena(
          membersData,
          firstPostImageEndPath,
          instagramPostText,
        );
        const data = await instagram.contentPublish(contenaId);
        if (data === null) return;
        return { postText: instagramPostText };
      })
      .with("二枚", async () => {
        const contenaIds = await instagram.makeContena(
          membersData,
          firstPostImageEndPath,
          secondPostImageEndPath,
        );
        const groupContenaId = await instagram.makeGroupContena(
          contenaIds,
          instagramPostText,
        );
        const data = await instagram.contentPublish(groupContenaId, "CAROUSEL");
        if (data === null) return;
        return { postText: instagramPostText };
      })
      .otherwise(() => {
        throw new Error(`Unsupported post image count: ${postImageCount}`);
      });
  },
};
