import { instagram } from ".";
import { Member } from "../../api";
import { instagramTemplate } from "./template";

export const instagramUseCase = {
  async makePost(membersData: Member[], title: string, youtubeUrl: string, firstPostImageEndPath: string, secondPostImageEndPath: string) {
    const instagramPostText = await instagramTemplate.post(membersData, title, youtubeUrl)
    const contenaIds = await instagram.makeContena(membersData, firstPostImageEndPath, secondPostImageEndPath)
    if(contenaIds === null) return
    const groupContenaId = await instagram.makeGroupContena(contenaIds, instagramPostText)
    if(groupContenaId === null) return
    const data = await instagram.contentPublish(groupContenaId)
    if(data === null) return
    console.log("自動投稿に成功しました！")

    return { postText: instagramPostText }
  }
};