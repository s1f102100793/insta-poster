import { sharpUtils } from ".";

export const sharpUseCase = {
  async savePostImage(firstPostImage: File, screenshot: File, secondCompositeImage: File, firstPostImageOutputPath: string, screenshotOutputPath: string, removeFrameImageOutputPath: string) {
    await sharpUtils.saveImage(firstPostImage, firstPostImageOutputPath)
    await sharpUtils.saveImage(screenshot, screenshotOutputPath)
    await sharpUtils.removeFrame(secondCompositeImage, removeFrameImageOutputPath)
  },
}