import { sleep } from "bun";
import { env } from "../../env";
import { s3 } from "../../s3";
import { MemberName, convertToInstagramId } from "../../service/memberName";
import { TagPosition, getPositionCoordinates } from "./getPositionCoordinates";

const instaBusinessId = env.INSTAGRAM_BUSINESS_ID;
const instaAccessToken = env.INSTAGRAM_ACCESS_TOKEN;

const headers = {
  'Authorization': `Bearer ${instaAccessToken}`,
  'Content-Type': 'application/json', 
};

export const instagram = {
  async makeContena(member: MemberName, tagPosition: TagPosition, s3Endpoint: string, firstPostImageOutputPath: string, secondPostImageOutputPath: string) {
    let contenaIds = [];

    const firstPostImageMediaUrl = await s3.generatePresignedUrl(firstPostImageOutputPath);
    const secondPostImageMediaUrl = await s3.generatePresignedUrl(secondPostImageOutputPath);

    const position = getPositionCoordinates(tagPosition);
    const mediaUrls = [
      {
        media_url: firstPostImageMediaUrl,
        type: 'IMAGE',
        user_tags: [{ username: `${convertToInstagramId(member)}`, ...position }]
      },
      {
        media_url: secondPostImageMediaUrl,
        type: 'IMAGE'    
      }
    ];

    for (const media of mediaUrls) {
      const postData = {
        image_url: media.media_url,
        media_type: media.type,
        is_carousel_item: true,
        user_tags: JSON.stringify(media.user_tags)
      };

      const url = `https://graph.facebook.com/v19.0/${instaBusinessId}/media?`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(postData)
        });

        if (!response.ok) {
          const errorData = await response.json(); 
          console.error('Instagram APIのリクエストでエラーが発生しました。', errorData);
          return null;
        }

        const data = await response.json() as { id: string };
        contenaIds.push(data.id);
      } catch (error) {
        console.error('Instagram APIのリクエスト中にエラーが発生しました:', error);
        return null;
      }
    }

    return contenaIds;
  },
  async makeGroupContena(contenaIds: string[], caption: string) {
    // DB登録を待つため20秒待つ
    await sleep(20000);
    const postData = {
      media_type: 'CAROUSEL',
      caption,
      children: contenaIds
    }

    const url = `https://graph.facebook.com/v19.0/${instaBusinessId}/media?`;
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Instagram APIのリクエストでエラーが発生しました。', errorData);
      return null;
    }

    const data = await response.json() as { id: string };
    return data.id;
  },
  async contentPublish(groupContenaId: string) {
    // DB登録を待つため20秒待つ
    await sleep(20000);

    const postData = {
      media_type: 'CAROUSEL',
      creation_id: groupContenaId
    }
    const url = `https://graph.facebook.com/v19.0/${instaBusinessId}/media_publish?`;
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Instagram APIのリクエストでエラーが発生しました。', errorData);
      return null;
    }
    
    const data = await response.json();
    return data;
  }
};