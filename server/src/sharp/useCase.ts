import { sharpUtils } from ".";
import { AuthorNameColor, RGBA } from "../api";
import { ImageSizes, paddingSize } from "../service/imageSizes";

export const sharpUseCase = {
  async saveImageWithFallback(
    imageBuffer: ArrayBuffer | Buffer,
    outputPath: string,
    imageName: string,
  ) {
    await sharpUtils.saveImage(imageBuffer, outputPath).catch(async (error) => {
      console.error(`Failed to save ${imageName}: ${error.message}`);
      // googlePhotoを当分使わないのでコメントアウト
      // await googlePhotosUseCase
      //   .uploadImage(imageBuffer, outputPath)
      //   .catch((uploadError) => {
      //     throw new Error(
      //       `Failed to upload ${imageName}: ${uploadError.message}`,
      //     );
      //   });
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
  async createMockIphoneHomeImage(
    screenshotImage: File,
    backgroundColor: RGBA,
    authorNameColor: AuthorNameColor,
  ): Promise<Buffer> {
    const screenshotImageBuffer = await screenshotImage.arrayBuffer();
    const resizeScreenshotBuffer = await sharpUtils.resizeImage(
      screenshotImageBuffer,
      ImageSizes.unifiedScreenshotSize,
    );
    const replaceCornersColorBuffer = await sharpUtils.replaceCornersColor(
      resizeScreenshotBuffer,
      backgroundColor,
    );
    const paddedScreenshotBuffer = await sharpUtils.extendImage(
      replaceCornersColorBuffer,
      {
        top: paddingSize,
        bottom: paddingSize,
        left: paddingSize,
        right: paddingSize,
      },
      backgroundColor,
    );
    const mockImageBuffer = await sharpUtils.compositeWithMockImage(
      paddedScreenshotBuffer,
    );
    const compositeImage = await sharpUtils.compositeWithBackgroundImage(
      mockImageBuffer,
      backgroundColor,
      authorNameColor,
    );
    return compositeImage;
  },
};
