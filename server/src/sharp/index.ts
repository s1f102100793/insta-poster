import sharp from "sharp";

interface sharpMetadata {
  width: number;
  height: number;
}

export const sharpUtils = {
  async mergeImages(image1: File, screenshot: File, outputPath: string) {
    const image1Buffer = await image1.arrayBuffer();
    const screenshotBuffer = await screenshot.arrayBuffer();

    const sharpImage1 = sharp(image1Buffer);
    const sharpScreenshot = sharp(screenshotBuffer);

    const image1Metadata = await sharpImage1.metadata() as sharpMetadata;
    const screenshotMetadata = await sharpScreenshot.metadata() as sharpMetadata;

    const unifiedWidth = Math.max(image1Metadata.width, screenshotMetadata.width);
    const canvasSideLength = unifiedWidth * 2;

    const resizedImage1Buffer = await sharpImage1.resize({ width: unifiedWidth }).toBuffer();
    const resizedScreenshotBuffer = await sharpScreenshot.resize({ width: unifiedWidth }).toBuffer();

    const resizedImage1Metadata = await sharp(resizedImage1Buffer).metadata() as sharpMetadata;
    const resizedScreenshotMetadata = await sharp(resizedScreenshotBuffer).metadata() as sharpMetadata;

    console.log("resizedImage1 size", resizedImage1Metadata.width, resizedImage1Metadata.height);
    console.log("resizedScreenshot size", resizedScreenshotMetadata.width, resizedScreenshotMetadata.height);

    const canvas = sharp({
      create: {
        width: canvasSideLength,
        height: canvasSideLength,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    });

    const resizedImage1BufferTop = Math.round((canvasSideLength - resizedImage1Metadata.height) / 2);
    const resizedScreenshotBufferTop = Math.round((canvasSideLength - resizedScreenshotMetadata.height) / 2);

    const compositeImage = canvas.composite([
      { input: resizedImage1Buffer, left: 0, top: resizedImage1BufferTop },
      { input: resizedScreenshotBuffer, left: unifiedWidth, top: resizedScreenshotBufferTop }
    ]);

    try {
      await compositeImage.toFile(outputPath);
    } catch (error) {
      console.error("Error saving image", error);
    }
  }
};
