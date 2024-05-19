import { instagram } from ".";
import { Member } from "../../api";
import { instagramTemplate } from "./template";

export const instagramUseCase = {
  async makePost(membersData: Member[], title: string, youtubeUrl: string, additionalHashTag:string | null, firstPostImageEndPath: string, secondPostImageEndPath: string, postImageCount: string) {
    console.log("Instagramの投稿を作成します。")
    // const instagramPostText = await instagramTemplate.post(membersData, title, youtubeUrl, additionalHashTag)
    const instagramPostText = "投稿テキスト"
    console.log("instagramPostText", instagramPostText)
    console.log("postImageCount", postImageCount)
    if (postImageCount === "一枚") {
      console.log("画像が一枚の場合の処理を行います。")
      const contenaId = await instagram.singlePostMakeContena(membersData, firstPostImageEndPath, instagramPostText)
      console.log("contenaIdを作成しました", )
      const data = await instagram.contentPublish(contenaId)
      console.log("投稿しました",)
      if (data === null) return
    } else if (postImageCount === "二枚") {   
      console.log("画像が二枚の場合の処理を行います。")
      const contenaIds = await instagram.makeContena(membersData, firstPostImageEndPath, secondPostImageEndPath)
      console.log("contenaIdsを作成しました", )
      const groupContenaId = await instagram.makeGroupContena(contenaIds, instagramPostText)
      console.log("groupContenaIdを作成しました", )
      const data = await instagram.contentPublish(groupContenaId, "CAROUSEL")
      console.log("投稿しました",)
      if (data === null) return
    } 
    return { postText: instagramPostText }
  }
};