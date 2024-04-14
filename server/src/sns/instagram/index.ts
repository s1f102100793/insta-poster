import { env } from "../../env";

const instaBusinessId = env.INSTAGRAM_BUSINESS_ID;
const instaAccessToken = env.INSTAGRAM_ACCESS_TOKEN;

export const instagram = {
  async makeContenaAPI(s3Endpoint: string, firstPostImageOutputPath: string, secondPostImageOutputPath: string) {
    let contenaIds = [];
    console.log('firstPostImageOutputPath:', firstPostImageOutputPath);

    const mediaUrls = [
      {
        id: 1,
        media_url: 'https://picsum.photos/200/300.jpg',
        type: 'IMAGE'
      },
      {
        id: 2,
        media_url: 'https://picsum.photos/200/300.jpg',
        type: 'IMAGE'    
      },
      {
        id: 3,
        media_url: `${s3Endpoint}/${env.S3_BUCKET}/${firstPostImageOutputPath}`,
        type: 'IMAGE'
      },
      {
        id: 4,
        media_url: `${s3Endpoint}/${env.S3_BUCKET}/${secondPostImageOutputPath}`,
        type: 'IMAGE'    
      }
    ];

    const headers = {
      'Authorization': `Bearer ${instaAccessToken}`,
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'skip' 
    };

    for (const media of mediaUrls) {
      const postData = {
        image_url: media.media_url,
        media_type: '',
        is_carousel_item: true
      };
      console.log('postData:', postData);

      const url = `https://graph.facebook.com/v19.0/${instaBusinessId}/media`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(postData)
        });

        if (!response.ok) {
          const errorData = await response.json(); 
          console.error('Instagram APIのリクエストでエラーが発生しました。', errorData);
        }

        // const data = await response.json();
        // console.log('Instagram APIのレスポンス:', data);
        // contenaIds.push(data.id);
      } catch (error) {
        // console.error('Instagram APIのレスポンスの解析中にエラーが発生しました:', error);
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