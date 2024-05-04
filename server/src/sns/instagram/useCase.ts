import { instagram } from ".";
import { Member } from "../../api";
import { instagramTemplate } from "./template";

export const instagramUseCase = {
  async makePost(membersData: Member[], title: string, youtubeUrl: string, firstPostImageEndPath: string, secondPostImageEndPath: string, postImageCount: string) {
    const instagramPostText = await instagramTemplate.post(membersData, title, youtubeUrl)
    if (postImageCount === "一枚") {
      const contenaId = await instagram.singlePostMakeContena(membersData, firstPostImageEndPath, instagramPostText)
      const data = await instagram.contentPublish(contenaId)
      if (data === null) return
    } else if (postImageCount === "二枚") {   
      const contenaIds = await instagram.makeContena(membersData, firstPostImageEndPath, secondPostImageEndPath)
      const groupContenaId = await instagram.makeGroupContena(contenaIds, instagramPostText)
      const data = await instagram.contentPublish(groupContenaId, "CAROUSEL")
      if(data === null) return
    } 
    return { postText: instagramPostText }
  }
};