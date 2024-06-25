import sharp from "sharp";
import { sharpUtils } from ".";
import { googlePhotosUseCase } from "../google/photosUseCase";
import { promises as fs } from "fs";

const cwd = process.cwd();
const mockImagePath = `${cwd}/assets/mock.png`;

export const sharpUseCase = {
  async saveImageWithFallback(
    imageBuffer: ArrayBuffer | Buffer,
    outputPath: string,
    imageName: string,
  ) {
    await sharpUtils.saveImage(imageBuffer, outputPath).catch(async () => {
      await googlePhotosUseCase
        .uploadImage(imageBuffer, outputPath)
        .catch((uploadError) => {
          throw new Error(
            `Failed to upload ${imageName}: ${uploadError.message}`,
          );
        });
    });
  },
  async savePostImage(
    firstPostImage: File,
    screenshot: File | null,
    secondCompositeImage: File | null,
    firstPostImageOutputPath: string,
    screenshotOutputPath: string,
    removeFrameImageOutputPath: string,
  ) {
    const firstPostImageBuffer = await firstPostImage.arrayBuffer();
    await sharpUseCase.saveImageWithFallback(
      firstPostImageBuffer,
      firstPostImageOutputPath,
      "first post image",
    );

    if (!screenshot || !secondCompositeImage) return;

    const screenshotBuffer = await screenshot.arrayBuffer();
    const secondCompositeImageBuffer = await secondCompositeImage.arrayBuffer();
    const removeFrameImage = await sharpUtils.removeFrame(
      secondCompositeImageBuffer,
    );
    await sharpUseCase.saveImageWithFallback(
      screenshotBuffer,
      screenshotOutputPath,
      "screenshot",
    );
    await sharpUseCase.saveImageWithFallback(
      removeFrameImage,
      removeFrameImageOutputPath,
      "remove frame image",
    );
  },
  async editImage(image: File): Promise<Buffer> {
    const imageBuffer = await image.arrayBuffer();
    const output = await sharpUtils.validateInstagramImageSize(imageBuffer);
    return output;
  },
  async createMockIphoneHomeImage(screenshotImage: File): Promise<Buffer> {
    const mockImageBuffer = await fs.readFile(mockImagePath);
    const screenshotImageBuffer = await screenshotImage.arrayBuffer();
    const unifiedScreenshotSize = {
      width: 870,
      height: 1882,
    };

    const resizeScreenshotBuffer1 = await sharp(screenshotImageBuffer)
      .resize(unifiedScreenshotSize)
      .toBuffer();

    const paddingSize = 100;
    const paddedScreenshotBuffer = await sharp(resizeScreenshotBuffer1)
      .extend({
        top: paddingSize,
        bottom: paddingSize,
        left: paddingSize,
        right: paddingSize,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .toBuffer();

    const resizeScreenshotBuffer2 = await sharp(paddedScreenshotBuffer)
      .resize({
        width: 850 + 2 * paddingSize,
        height: 1850 + 2 * paddingSize,
      })
      .toBuffer();

    const compositeImage = await sharp(resizeScreenshotBuffer2)
      .composite([{ input: mockImageBuffer, blend: "over" }])
      .toBuffer();

    return compositeImage;
  },
};
