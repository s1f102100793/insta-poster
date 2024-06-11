import { s3 } from ".";
import { env } from "../env";
import { ngrokUtils } from "../ngrok";
import { sharpUtils } from "../sharp";

export const s3UseCase = {
  async uploadImages(
    firstPostImage: File,
    screenshot: File | null,
    secondPostImageOutputPath: string,
    removeFrameImageOutputPath: string,
    firstPostImageEndPath: string,
    secondPostImageEndPath: string,
  ) {
    const firstPostImageBuffer = Buffer.from(
      await firstPostImage.arrayBuffer(),
    );
    await s3.upload(firstPostImageEndPath, firstPostImageBuffer);
    if (!screenshot) return;
    const secondPostImageBuffer = await sharpUtils.mergeImages(
      removeFrameImageOutputPath,
      screenshot,
      secondPostImageOutputPath,
    );
    await s3.upload(secondPostImageEndPath, secondPostImageBuffer);
  },
  async checkEndpoint() {
    let s3Endpoint = env.S3_ENDPOINT;
    const url = new URL(s3Endpoint);
    const isLocalhost = url.href.startsWith("http://localhost:");
    if (isLocalhost) {
      s3Endpoint = await ngrokUtils.start();
    }
  },
};
