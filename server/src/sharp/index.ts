import sharp from "sharp";
import path from "path";
import { ensureDir } from "../fs";
import { promises as fs } from "fs";
import { path as pathUtils } from "../service/path";
import { ImageSizeType, ImageSizes } from "../service/imageSizes";
import { P, match } from "ts-pattern";
import { RGBA } from "../api";
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
  async resizeImage(
    imageBuffer: ArrayBuffer | Buffer,
    imageSize: ImageSizeType,
  ) {
    return await sharp(imageBuffer).resize(imageSize).toBuffer();
  },
  async extendImage(
    imageBuffer: ArrayBuffer | Buffer,
    padding: { top: number; bottom: number; left: number; right: number },
    backgroundColor?: RGBA,
  ): Promise<Buffer> {
    const bgColor = backgroundColor || { r: 255, g: 255, b: 255, alpha: 1 };
    return await sharp(imageBuffer)
      .extend({
        top: padding.top,
        bottom: padding.bottom,
        left: padding.left,
        right: padding.right,
        background: bgColor,
      })
      .toBuffer();
  },
  async replaceColor(imageBuffer: Buffer, replacementColor: RGBA) {
    let image = sharp(imageBuffer);
    const { width, height, channels } = await image.metadata();

    if (!width || !height) {
      throw new Error("Image must have width and height");
    }

    if (channels === 4) {
      image = image.removeAlpha();
    }

    const raw = await image.raw().toBuffer();
    const targetColor: [number, number, number, number] = [255, 255, 255, 1];

    for (let i = 0; i < raw.length; i += 3) {
      const currentColor = [raw[i], raw[i + 1], raw[i + 2]];
      const isTargetColor = currentColor.every(
        (value, index) => value === targetColor[index],
      );

      if (isTargetColor) {
        raw[i] = replacementColor.r;
        raw[i + 1] = replacementColor.g;
        raw[i + 2] = replacementColor.b;
      }
    }

    const replacedImage = await sharp(raw, {
      raw: { width, height, channels: 3 },
    })
      .toFormat("png")
      .toBuffer();
    return replacedImage;
  },
  async validateInstagramImageSize(imageBuffer: ArrayBuffer): Promise<Buffer> {
    const image = sharp(Buffer.from(imageBuffer));
    const metadata = await image.metadata();

    const minAspectRatio = 566 / 1080;
    const maxAspectRatio = 1350 / 1080;
    const imageAspectRatio = metadata.height! / metadata.width!;

    return match(imageAspectRatio)
      .with(
        P.when((ratio) => ratio < minAspectRatio),
        async () => {
          const targetHeight = metadata.width! * minAspectRatio;
          const padding = Math.round((targetHeight - metadata.height!) / 2);
          return await sharpUtils.extendImage(imageBuffer, {
            top: padding,
            bottom: padding,
            left: 0,
            right: 0,
          });
        },
      )
      .with(
        P.when((ratio) => ratio > maxAspectRatio),
        async () => {
          const targetWidth = metadata.height! / maxAspectRatio;
          const padding = Math.round((targetWidth - metadata.width!) / 2);
          return await sharpUtils.extendImage(imageBuffer, {
            top: 0,
            bottom: 0,
            left: padding,
            right: padding,
          });
        },
      )
      .otherwise(async () => await image.toBuffer());
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
  async compositeWithBackgroundImage(
    mockImageBuffer: Buffer,
    backgroundColor: RGBA,
  ) {
    const backgroundImageBuffer = await fs.readFile(
      pathUtils.backgroundImagePath,
    );

    const resultBuffer = await sharpUtils.replaceColor(
      backgroundImageBuffer,
      backgroundColor,
    );

    const resizedMockImageBuffer = await sharp(mockImageBuffer)
      .resize(870, 1700)
      .toBuffer();

    const left = Math.round((2000 - 870) / 2);
    const top = 75;
    const compositeImage = await sharp(resultBuffer)
      .composite([
        { input: resizedMockImageBuffer, top: top, left: left, blend: "over" },
      ])
      .toBuffer();

    return compositeImage;
  },
};
