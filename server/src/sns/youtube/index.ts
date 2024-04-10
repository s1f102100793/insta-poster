import { env } from "../../env";

interface youtubeVideoTitle {
  items: [
    {
      snippet: {
        title: string;
      };
    }
  ];
}

export const youtube = {
  getVideoId(youtubeUrl: string) {
    const url = new URL(youtubeUrl);
    return url.searchParams.get('v');
  },
  async getVideoTitle(videoId: string) {
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${env.YOUTUBE_DATA_API_KEY}&part=snippet`;
    const response = await fetch(apiUrl);
    const data = await response.json() as youtubeVideoTitle;
    return data.items[0].snippet.title;
  }
}