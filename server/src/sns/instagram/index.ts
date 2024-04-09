import { instagramTemplate } from "./template";

export const instagram = {
  async makePost(member:string, title:string, youtubeUrl:string) {
    console.log(instagramTemplate.post(member, title, youtubeUrl))
  }
};