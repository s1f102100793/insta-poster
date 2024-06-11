import { sleep } from "bun";
import { env } from "../../env";
import { s3 } from "../../s3";
import { Member } from "../../api";
import { getInstagramUserTags } from "./userTags";

const instaBusinessId = env.INSTAGRAM_BUSINESS_ID;
const instaAccessToken = env.INSTAGRAM_ACCESS_TOKEN;

const headers = {
  Authorization: `Bearer ${instaAccessToken}`,
  "Content-Type": "application/json",
};

export const instagram = {
  async singlePostMakeContena(
    members: Member[],
    firstPostImageOutputPath: string,
    caption: string,
  ) {
    const firstPostImageMediaUrl = await s3.generatePresignedUrl(
      firstPostImageOutputPath,
    );
    const url = `https://graph.facebook.com/v19.0/${instaBusinessId}/media?`;
    const userTags = getInstagramUserTags(members);
    const postData = {
      image_url: firstPostImageMediaUrl,
      caption,
      media_type: "IMAGE",
      user_tags: userTags,
    };
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(postData),
    });
    const data = (await response.json()) as { id: string };
    return data.id;
  },
  async makeContena(
    members: Member[],
    firstPostImageOutputPath: string,
    secondPostImageOutputPath: string,
  ) {
    let contenaIds = [];

    const firstPostImageMediaUrl = await s3.generatePresignedUrl(
      firstPostImageOutputPath,
    );
    const secondPostImageMediaUrl = await s3.generatePresignedUrl(
      secondPostImageOutputPath,
    );
    const userTags = getInstagramUserTags(members);
    const mediaUrls = [
      {
        media_url: firstPostImageMediaUrl,
        user_tags: userTags,
      },
      {
        media_url: secondPostImageMediaUrl,
      },
    ];

    for (const media of mediaUrls) {
      const postData = {
        image_url: media.media_url,
        media_type: "IMAGE",
        is_carousel_item: true,
        user_tags: JSON.stringify(media.user_tags),
      };
      const url = `https://graph.facebook.com/v19.0/${instaBusinessId}/media?`;
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(postData),
      });
      const data = (await response.json()) as { id: string };
      contenaIds.push(data.id);
    }

    return contenaIds;
  },
  async makeGroupContena(contenaIds: string[], caption: string) {
    // DB登録を待つため20秒待つ
    await sleep(20000);
    const postData = {
      media_type: "CAROUSEL",
      caption,
      children: contenaIds,
    };

    const url = `https://graph.facebook.com/v19.0/${instaBusinessId}/media?`;
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(postData),
    });

    const data = (await response.json()) as { id: string };
    return data.id;
  },
  async contentPublish(groupContenaId: string, mediaType?: string) {
    // DB登録を待つため20秒待つ
    await sleep(20000);
    let postData;
    if (!mediaType) {
      postData = {
        creation_id: groupContenaId,
      };
    } else {
      postData = {
        media_type: mediaType,
        creation_id: groupContenaId,
      };
    }

    const url = `https://graph.facebook.com/v19.0/${instaBusinessId}/media_publish?`;
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(postData),
    });
    const data = await response.json();
    return data;
  },
};
