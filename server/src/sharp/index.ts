import sharp from "sharp";
import path from "path";
import { ensureDir } from "../fs";
import { promises as fs } from "fs";
import { path as pathUtils } from "../service/path";

import { ImageSizeType, ImageSizes } from "../service/imageSizes";
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
    const metadata = (await sharpImage.metadata()) as sharpMetadata;
    const frameWidth = 140;
    const newSideLength = metadata.width - frameWidth * 2;

    const trimmedImageBuffer = await sharpImage
      .extract({
        left: frameWidth,
        top: frameWidth,
        width: newSideLength,
        height: newSideLength,
      })
      .toBuffer();
    return trimmedImageBuffer;
  },
  async mergeImages(image1Path: string, screenshot: File, outputPath: string) {
    const screenshotBuffer = await screenshot.arrayBuffer();

    const sharpImage1 = sharp(image1Path);
    const sharpScreenshot = sharp(screenshotBuffer);

    const image1Metadata = (await sharpImage1.metadata()) as sharpMetadata;
    const screenshotMetadata =
      (await sharpScreenshot.metadata()) as sharpMetadata;

    const unifiedWidth = Math.max(
      image1Metadata.width,
      screenshotMetadata.width,
    );
    const canvasSideLength = unifiedWidth * 2;

    const resizedImage1Buffer = await sharpImage1
      .resize({ width: unifiedWidth })
      .toBuffer();
    const resizedScreenshotBuffer = await sharpScreenshot
      .resize({ width: unifiedWidth })
      .toBuffer();

    const resizedImage1Metadata = (await sharp(
      resizedImage1Buffer,
    ).metadata()) as sharpMetadata;
    const resizedScreenshotMetadata = (await sharp(
      resizedScreenshotBuffer,
    ).metadata()) as sharpMetadata;

    const canvas = sharp({
      create: {
        width: canvasSideLength,
        height: canvasSideLength,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    });

    const resizedImage1BufferTop = Math.round(
      (canvasSideLength - resizedImage1Metadata.height) / 2,
    );
    const resizedScreenshotBufferTop = Math.round(
      (canvasSideLength - resizedScreenshotMetadata.height) / 2,
    );

    const compositeImage = canvas.composite([
      {
        input: resizedImage1Buffer,
        left: unifiedWidth,
        top: resizedImage1BufferTop,
      },
      {
        input: resizedScreenshotBuffer,
        left: 0,
        top: resizedScreenshotBufferTop,
      },
    ]);
    const quality = 100;
    await compositeImage.jpeg({ quality }).toFile(outputPath);

    const buffer = await compositeImage.toBuffer();
    return buffer;
  },
  async validateInstagramImageSize(imageBuffer: ArrayBuffer): Promise<Buffer> {
    const image = sharp(Buffer.from(imageBuffer));
    const metadata = await image.metadata();

    const minAspectRatio = 566 / 1080;
    const maxAspectRatio = 1350 / 1080;
    const imageAspectRatio = metadata.height! / metadata.width!;

    if (imageAspectRatio < minAspectRatio) {
      const targetHeight = metadata.width! * minAspectRatio;
      const padding = Math.round((targetHeight - metadata.height!) / 2);
      return await image
        .extend({
          top: padding,
          bottom: padding,
          left: 0,
          right: 0,
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .toBuffer();
    } else if (imageAspectRatio > maxAspectRatio) {
      const targetWidth = metadata.height! / maxAspectRatio;
      const padding = Math.round((targetWidth - metadata.width!) / 2);
      return await image
        .extend({
          top: 0,
          bottom: 0,
          left: padding,
          right: padding,
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .toBuffer();
    }
    return await image.toBuffer();
  },
  async compositeWithMockImage(screenshotBuffer: Buffer) {
    const resizeScreenshotBuffer = await sharpUtils.resizeImage(
      screenshotBuffer,
      ImageSizes.iphoneMockupBaseSize,
    );
    const mockImageBuffer = await fs.readFile(pathUtils.mockImagePath);
    const compositeImage = await sharp(resizeScreenshotBuffer)
      .composite([{ input: mockImageBuffer, blend: "over" }])
      .toBuffer();
    return compositeImage;
  },
  async resizeImage(
    imageBuffer: ArrayBuffer | Buffer,
    imageSize: ImageSizeType,
  ) {
    return await sharp(imageBuffer).resize(imageSize).toBuffer();
  },
};
