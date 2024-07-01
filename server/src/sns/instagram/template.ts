import { Member } from "../../api";
import { getUnitName } from "../../service/memberName";
import { youtube } from "../youtube";

export const instagramTemplate = {
  async post(
    membersData: Member[],
    title: string,
    youtubeUrl: string,
    additionalHashTag: string | null,
  ) {
    const memberNameHashtags = membersData
      .map((member) => `#東海オンエア${member.memberName}`)
      .join(" ");
    const unitName = getUnitName(membersData);
    const unitNameHashtag =
      membersData.length === 2 || membersData.length === 3
        ? `#${unitName}`
        : "";

    let postText = `${memberNameHashtags}
【${title}】
`;

    if (youtubeUrl) {
      const videoId = youtube.getVideoId(youtubeUrl) as string;
      const youtubeTitle = await youtube.getVideoTitle(videoId);
      postText += `
Source: 
${youtubeTitle}
${youtubeUrl}
`;
    }

    postText += `
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
${unitNameHashtag}`;

    if (additionalHashTag) {
      postText += `#${additionalHashTag}`;
    }

    return postText;
  },
};
