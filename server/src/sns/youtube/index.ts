import { env } from "../../env";

interface youtubeVideoTitle {
  items: [
    {
      snippet: {
        title: string;
      };
    },
  ];
}

export const youtube = {
  getVideoId(youtubeUrl: string) {
    const url = new URL(youtubeUrl);
    let videoId = url.searchParams.get("v");
    if (!videoId) {
      const match = youtubeUrl.match(
        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      );
      if (match && match[1]) {
        videoId = match[1];
      }
    }
    return videoId;
  },
  async getVideoTitle(videoId: string) {
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${env.YOUTUBE_DATA_API_KEY}&part=snippet`;
    const response = await fetch(apiUrl);
    const data = (await response.json()) as youtubeVideoTitle;
    return data.items[0].snippet.title;
  },
};
