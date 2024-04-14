import { sleep } from "bun";
import { env } from "../../env";
import { s3 } from "../../s3";

const instaBusinessId = env.INSTAGRAM_BUSINESS_ID;
const instaAccessToken = env.INSTAGRAM_ACCESS_TOKEN;

export const instagram = {
  async makeContena(s3Endpoint: string, firstPostImageOutputPath: string, secondPostImageOutputPath: string) {
    let contenaIds = [];

    const firstPostImageMediaUrl = await s3.generatePresignedUrl(firstPostImageOutputPath);
    const secondPostImageMediaUrl = await s3.generatePresignedUrl(secondPostImageOutputPath);

    const mediaUrls = [
      {
        media_url: firstPostImageMediaUrl,
        type: 'IMAGE'
      },
      {
        media_url: secondPostImageMediaUrl,
        type: 'IMAGE'    
      }
    ];

    const headers = {
      'Authorization': `Bearer ${instaAccessToken}`,
      'Content-Type': 'application/json', 
    };

    for (const media of mediaUrls) {
      const postData = {
        image_url: media.media_url,
        media_type: media.type,
        is_carousel_item: true,
        caption: '#BronzFonz'
      };

      const url = `https://graph.facebook.com/v19.0/${instaBusinessId}/media?`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: headers,
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
  async makeGroupContena(contenaIds: string[]) {
    // DB登録を待つため20秒待つ
    await sleep(20000);
    const postData = {
      media_type: 'CAROUSEL',
      caption: '#BronzFonz',
      children: contenaIds
    }
    const url = `https://graph.facebook.com/v17.0/${instaBusinessId}/media?`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${instaAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Instagram APIのリクエストでエラーが発生しました。', errorData);
      return null;
    }

    const data = await response.json();
    return data;
  },
  async makePost(member:string, title:string, youtubeUrl:string) {
    
  }
};