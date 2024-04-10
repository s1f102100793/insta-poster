import sharp from "sharp";

export const sharpUtils = {
  async mergeImages (image1: File, screenshot: File, outputPath: string) {
    const image1Buffer = await image1.arrayBuffer();
    const screenshotBuffer = await screenshot.arrayBuffer();

    const sharpImage1 = sharp(image1Buffer);
    const sharpScreenshot = sharp(screenshotBuffer);

    const image1Metadata = await sharpImage1.metadata();
    const screenshotMetadata = await sharpScreenshot.metadata();

    const newWidth = image1Metadata.width as number + screenshotMetadata.width as number;
    const newHeight = Math.max(image1Metadata.height as number, screenshotMetadata.height as number);
    const newSideLength = Math.max(image1Metadata.height, screenshotMetadata.height);

    const image1Offset = Math.floor((newSideLength - image1Metadata.height) / 2);
    const screenshotOffset = Math.floor((newSideLength - screenshotMetadata.height) / 2);

    const canvas = sharp({
      create: {
        width: newSideLength * 2,
        height: newSideLength,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 } // 白背景
      }
    });

    const compositeImage = canvas.composite([
      { input: await sharpImage1.extract({ width: image1Metadata.width / 2, height: image1Metadata.height, left: image1Metadata.width / 4, top: 0 }).toBuffer(), left: newSideLength, top: image1Offset },
      { input: await sharpScreenshot.extract({ width: screenshotMetadata.width / 2, height: screenshotMetadata.height, left: 0, top: 0 }).toBuffer(), left: 0, top: screenshotOffset }
    ]);
    try {
      await compositeImage.toFile(outputPath);
    } catch (error) {
      console.error("Error saving image", error);
    }
  }
};