import { playwrightAction } from "../../playwright";
import { instagramTemplate } from "./template";

export const instagram = {
  async makePost(member:string, title:string, youtubeUrl:string) {
    await playwrightAction.postInstagram()
  }
};