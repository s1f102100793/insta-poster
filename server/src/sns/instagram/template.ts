import { youtube } from "../youtube";

export const instagramTemplate = {
  async post(member:string, title:string, youtubeUrl:string) {
    const videoId = youtube.getVideoId(youtubeUrl) as string
    const youtubeTitle = await youtube.getVideoTitle(videoId)

    return `
#東海オンエア${member}
【${title}】

Source: 
${youtubeTitle}
${youtubeUrl}


#東海いらすとや
#東海オンエア描いちゃった
#東海オンエアファン
#東海オンエア
#東海オンエアてつや
#東海オンエアしばゆー
#東海オンエアりょう
#東海オンエアとしみつ
#東海オンエアゆめまる
#東海オンエア虫眼鏡
#東海オンエアファンと繋がりたい
#東海オンエア好きな人と繋がりたい
        `;
  }
};