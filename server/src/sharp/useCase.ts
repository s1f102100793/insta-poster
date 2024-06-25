import sharp from "sharp";
import { sharpUtils } from ".";
import { googlePhotosUseCase } from "../google/photosUseCase";
import { ImageSizes, paddingSize } from "../service/imageSizes";

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
    const screenshotImageBuffer = await screenshotImage.arrayBuffer();
    const resizeScreenshotBuffer = await sharpUtils.resizeImage(
      screenshotImageBuffer,
      ImageSizes.unifiedScreenshotSize,
    );
    const paddedScreenshotBuffer = await sharp(resizeScreenshotBuffer)
      .extend({
        top: paddingSize,
        bottom: paddingSize,
        left: paddingSize,
        right: paddingSize,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .toBuffer();

    const compositeImage = await sharpUtils.compositeWithMockImage(
      paddedScreenshotBuffer,
    );
    return compositeImage;
  },
};
