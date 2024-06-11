import { googlePhotosUtils } from "./photos";

export const googlePhotosUseCase = {
  async uploadImage(imageBuffer: ArrayBuffer | Buffer, outputPath: string) {
    const albumTitle = googlePhotosUtils.generateAlbumTitle(outputPath);
    const albumId = await googlePhotosUtils.createAlbumIfNotExists(albumTitle);
    await googlePhotosUtils.uploadImage(imageBuffer, outputPath, albumId);
  },
};
