import { sharpUtils } from ".";

export const sharpUseCase = {
  async savePostImage(firstPostImage: File, screenshot: File | null, secondCompositeImage: File | null, firstPostImageOutputPath: string, screenshotOutputPath: string, removeFrameImageOutputPath: string) {
    const firstPostImageBuffer = await firstPostImage.arrayBuffer()
    await sharpUtils.saveImage(firstPostImageBuffer, firstPostImageOutputPath)
    if (!screenshot || !secondCompositeImage) return
    const screenshotBuffer = await screenshot.arrayBuffer()
    const secondCompositeImageBuffer = await secondCompositeImage.arrayBuffer()
    await sharpUtils.saveImage(screenshotBuffer, screenshotOutputPath)
    const removeFrameImage = await sharpUtils.removeFrame(secondCompositeImageBuffer)
    await sharpUtils.saveImage(removeFrameImage, removeFrameImageOutputPath)
  },
}