import { env } from "../../env";

const instaBusinessId = env.INSTAGRAM_BUSINESS_ID;
const instaAccessToken = env.INSTAGRAM_ACCESS_TOKEN;

export const instagram = {
  async makeContenaAPI(firstPostImageOutputPath: string, secondPostImageOutputPath: string) {
    let contenaIds = [];

    const mediaUrls = [
      {
        media_url: firstPostImageOutputPath,
        type: 'IMAGE'
      },
      {
        media_url: secondPostImageOutputPath,
        type: 'IMAGE'    
      }
    ];

    for (const media of mediaUrls) {
      const postData = {
        image_url: media.media_url,
        media_type: media.type,
        is_carousel_item: true
      };
      console.log('postData:', postData);

      const url = `https://graph.facebook.com/v17.0/${instaBusinessId}/media?`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData)
        });

        if (!response.ok) {
          const errorData = await response.json(); 
          console.error('Instagram APIのリクエストでエラーが発生しました。', errorData);
          throw new Error(`Instagram APIのリクエストでエラーが発生しました。 ステータスコード: ${response.status}`);
        }

        const data = await response.json();
        console.log('Instagram APIのレスポンス:', data);
        contenaIds.push(data.id);
      } catch (error) {
        console.error('Instagram APIのレスポンスの解析中にエラーが発生しました:', error);
        throw error;
      }
    }

    return contenaIds;
  },
  async makeGroupContenaAPI(contenaIds: string[]) {
    Utilities.sleep(20000); 
    const postData = {
      media_type: 'CAROUSEL',
      caption: '#BronzFonz',
      children: contenaIds
    }
    const url = `https://graph.facebook.com/v17.0/${instaBusinessId}/media?`;
  const response = instagram.api(url, 'POST', postData);

  try {
    if (response) {
      const data = JSON.parse(response.getContentText());
      return data.id;
    } else {
      console.error('Instagram APIのリクエストでエラーが発生しました。');
      return null;
    }
  } catch (error) {
    console.error('Instagram APIのレスポンスの解析中にエラーが発生しました:', error);
    return null;
  }
  },
  async api(url:string, method:string, postData:object) {
    try {
      const data = postData
      const headers = {
        'Authorization': 'Bearer ' + instaAccessToken,
        'Content-Type': 'application/json',
      };
      const options = {
        'method': method,
        'headers': headers,
        'payload': JSON.stringify(data),
        'muteHttpExceptions' : true,
        'validateHttpsCertificates' : false,
        'followRedirects' : false
      };
  
      const response = UrlFetchApp.fetch(url, options);
      return response;
    } catch (error) {
      console.error('Instagram APIのリクエスト中にエラーが発生しました:', error);
      return null;
    }
  },
  async makePost(member:string, title:string, youtubeUrl:string) {
    
  }
};