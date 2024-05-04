import { sharpUtils } from ".";

export const sharpUseCase = {
  async savePostImage(firstPostImage: File, screenshot: File | null, secondCompositeImage: File | null, firstPostImageOutputPath: string, screenshotOutputPath: string, removeFrameImageOutputPath: string) {
    await sharpUtils.saveImage(firstPostImage, firstPostImageOutputPath)
    if (!screenshot || !secondCompositeImage) return
    await sharpUtils.saveImage(screenshot, screenshotOutputPath)
    await sharpUtils.removeFrame(secondCompositeImage, removeFrameImageOutputPath)
  },
}