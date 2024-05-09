import sharp from "sharp";
import path from "path";
import { ensureDir } from "../fs";

interface sharpMetadata {
  width: number;
  height: number;
}

export const sharpUtils = {
  async saveImage(imageBuffer: ArrayBuffer | Buffer, outputPath: string) {
    const dir = path.dirname(outputPath);
    await ensureDir(dir);
    await sharp(imageBuffer).toFile(outputPath);
  },
  async removeFrame(imageBuffer: ArrayBuffer) {
    const sharpImage = sharp(imageBuffer);
    const metadata = await sharpImage.metadata() as sharpMetadata;
    const frameWidth = 140;
    const newSideLength = metadata.width - frameWidth * 2;

    const trimmedImageBuffer = await sharpImage.extract({
      left: frameWidth,
      top: frameWidth,
      width: newSideLength,
      height: newSideLength
    }).toBuffer();
    return trimmedImageBuffer;
  },
  async mergeImages(image1Path: string, screenshot: File, outputPath: string) {
    const screenshotBuffer = await screenshot.arrayBuffer();

    const sharpImage1 = sharp(image1Path); 
    const sharpScreenshot = sharp(screenshotBuffer);

    const image1Metadata = await sharpImage1.metadata() as sharpMetadata;
    const screenshotMetadata = await sharpScreenshot.metadata() as sharpMetadata;

    const unifiedWidth = Math.max(image1Metadata.width, screenshotMetadata.width);
    const canvasSideLength = unifiedWidth * 2;

    const resizedImage1Buffer = await sharpImage1.resize({ width: unifiedWidth }).toBuffer();
    const resizedScreenshotBuffer = await sharpScreenshot.resize({ width: unifiedWidth }).toBuffer();

    const resizedImage1Metadata = await sharp(resizedImage1Buffer).metadata() as sharpMetadata;
    const resizedScreenshotMetadata = await sharp(resizedScreenshotBuffer).metadata() as sharpMetadata;

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
      { input: resizedImage1Buffer, left: unifiedWidth, top: resizedImage1BufferTop },
      { input: resizedScreenshotBuffer, left: 0, top: resizedScreenshotBufferTop }
    ]);
    const quality = 100;
    await compositeImage.jpeg({ quality }).toFile(outputPath);

    const buffer = await compositeImage.toBuffer();
    return buffer;
  }
};
