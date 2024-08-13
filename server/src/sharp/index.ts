import sharp from "sharp";
import path from "path";
import { ensureDir } from "../fs";
import { promises as fs } from "fs";
import { path as pathUtils } from "../service/path";
import { ImageSizeType, ImageSizes } from "../service/imageSizes";
import { P, match } from "ts-pattern";
import { AuthorNameColor, RGBA } from "../api";

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
  async replaceColor(
    imageBuffer: Buffer,
    targetColor: RGBA,
    replacementColor: RGBA,
  ) {
    let image = sharp(imageBuffer);
    const { width, height, channels } = await image.metadata();

    if (!width || !height) {
      throw new Error("Image must have width and height");
    }

    if (channels === 4) {
      image = image.removeAlpha();
    }

    const raw = await image.raw().toBuffer();

    for (let i = 0; i < raw.length; i += 3) {
      const currentColor = [raw[i], raw[i + 1], raw[i + 2]];
      const isTargetColor = currentColor.every(
        (value, index) =>
          value === [targetColor.r, targetColor.g, targetColor.b][index],
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
  async replaceCornersColor(
    imageBuffer: Buffer,
    backgroundColor: RGBA,
  ): Promise<Buffer> {
    const paddingSize: number = 10;
    const { r, g, b, alpha } = backgroundColor;
    const colorFill = `rgba(${r},${g},${b},${alpha})`;

    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    const overlays = [
      {
        input: Buffer.from(
          `<svg><rect x="0" y="0" width="${paddingSize}" height="${paddingSize}" fill="${colorFill}" /></svg>`,
        ),
        top: 0,
        left: 0,
      },
      {
        input: Buffer.from(
          `<svg><rect x="0" y="0" width="${paddingSize}" height="${paddingSize}" fill="${colorFill}" /></svg>`,
        ),
        top: 0,
        left: metadata.width! - paddingSize,
      },
      {
        input: Buffer.from(
          `<svg><rect x="0" y="0" width="${paddingSize}" height="${paddingSize}" fill="${colorFill}" /></svg>`,
        ),
        top: metadata.height! - paddingSize,
        left: 0,
      },
      {
        input: Buffer.from(
          `<svg><rect x="0" y="0" width="${paddingSize}" height="${paddingSize}" fill="${colorFill}" /></svg>`,
        ),
        top: metadata.height! - paddingSize,
        left: metadata.width! - paddingSize,
      },
    ];

    return await image.composite(overlays).toBuffer();
  },
  async validateInstagramImageSize(
    imageBuffer: ArrayBuffer | Buffer,
    targetSizeMB: number = 1,
    initialQuality: number = 70,
    qualityStep: number = 5,
  ): Promise<Buffer> {
    const image = Buffer.isBuffer(imageBuffer)
      ? sharp(imageBuffer)
      : sharp(Buffer.from(imageBuffer));
    const metadata = await image.metadata();

    const bytesInMB = 1024 * 1024;
    const minAspectRatio = 566 / 1080;
    const maxAspectRatio = 1350 / 1080;
    const imageAspectRatio = metadata.height! / metadata.width!;

    const processedImage = await match(imageAspectRatio)
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

    let compressedBuffer: Buffer;
    let processedImageBuffer: Buffer = processedImage;
    let currentSizeMB = processedImageBuffer.length / bytesInMB;

    while (currentSizeMB > targetSizeMB && initialQuality >= 10) {
      compressedBuffer = await sharp(processedImageBuffer)
        .jpeg({ quality: initialQuality })
        .toBuffer();

      currentSizeMB = compressedBuffer.length / bytesInMB;

      if (currentSizeMB <= targetSizeMB) {
        return compressedBuffer;
      }

      initialQuality -= qualityStep;
      processedImageBuffer = compressedBuffer;
    }

    return processedImageBuffer;
  },
  async compositeWithMockImage(screenshotBuffer: Buffer) {
    const mockImageBuffer = await fs.readFile(pathUtils.mockImagePath);
    const compositeImage = await sharp(screenshotBuffer)
      .composite([{ input: mockImageBuffer, blend: "over" }])
      .toBuffer();
    return compositeImage;
  },
  async compositeWithBackgroundImage(
    mockImageBuffer: Buffer,
    backgroundColor: RGBA,
    authorNameColor: AuthorNameColor,
  ) {
    let backgroundImagePath = pathUtils.backgroundImagePath(authorNameColor);
    const targetColor =
      authorNameColor === "black"
        ? { r: 255, g: 255, b: 255, alpha: 1 }
        : { r: 0, g: 0, b: 0, alpha: 1 };
    const backgroundImageBuffer = await fs.readFile(backgroundImagePath);

    const resultBuffer = await sharpUtils.replaceColor(
      backgroundImageBuffer,
      targetColor,
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
