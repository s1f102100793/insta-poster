import fetch from 'node-fetch';
import { env } from '../env';

const accessToken = env.GOOGLE_PHOTOS_ACCESS_TOKEN;
const albumsUrl = `https://photoslibrary.googleapis.com/v1/albums`;
const basicHeaders = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
};

export const googlePhotosUtils = {
  async getAlbumByName(albumTitle: string): Promise<string | null> {
    const listAlbumsResponse = await fetch(albumsUrl, {
      method: 'GET',
      headers: basicHeaders
    });
    console.log('listAlbumsResponse', listAlbumsResponse);

    if (!listAlbumsResponse.ok) {
      throw new Error(`Failed to list albums: ${listAlbumsResponse.statusText}`);
    }

    const listAlbumsResult = await listAlbumsResponse.json();
    const album = listAlbumsResult.albums.find((album: any) => album.title === albumTitle);
    return album ? album.id : null;
  },

  async createAlbumIfNotExists(albumTitle: string): Promise<string> {
    let albumId = await googlePhotosUtils.getAlbumByName(albumTitle);
    console.log('albumId', albumId);
    if (albumId) {
      return albumId;
    }
    const createAlbumResponse = await fetch(albumsUrl, {
      method: 'POST',
      headers: basicHeaders,
      body: JSON.stringify({
        album: { title: albumTitle }
      })
    });

    if (!createAlbumResponse.ok) {
      throw new Error(`Failed to create album: ${createAlbumResponse.statusText}`);
    }

    const createAlbumResult = await createAlbumResponse.json();
    return createAlbumResult.id;
  },

  async uploadImage(imageBuffer: ArrayBuffer | Buffer, outputPath: string, albumId: string) {
    const newFileName = googlePhotosUtils.generateGooglePhotosFileName(outputPath);
    const uploadUrl = `https://photoslibrary.googleapis.com/v1/uploads`;
    const createMediaItemUrl = `https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate`;
    const uploadHeaders = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/octet-stream',
      'X-Goog-Upload-File-Name': newFileName,
      'X-Goog-Upload-Protocol': 'raw'
    };

    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: uploadHeaders,
      body: imageBuffer
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload image: ${uploadResponse.statusText}`);
    }

    const uploadToken = await uploadResponse.text();

    const createMediaItemResponse = await fetch(createMediaItemUrl, {
      method: 'POST',
      headers: basicHeaders,
      body: JSON.stringify({
        albumId: albumId,
        newMediaItems: [
          {
            simpleMediaItem: {
              uploadToken
            }
          }
        ]
      })
    });

    if (!createMediaItemResponse.ok) {
      throw new Error(`Failed to create media item: ${createMediaItemResponse.statusText}`);
    }

    const createMediaItemResult = await createMediaItemResponse.json();
    return createMediaItemResult;
  },
// 残りここを変更する
  generateGooglePhotosFileName(outputPath: string): string {
    const basePath = env.OUTPUT_PATH ?? '../output';
    const relativePath = outputPath.startsWith(basePath) 
      ? outputPath.slice(basePath.length + 1)
      : outputPath;

    const parts = relativePath.split('/');
    const folderPrefix = parts.length > 1 ? parts[0] : '';
    const baseName = parts[parts.length - 1];
    const unitName = baseName.split('_')[0];
    const suffix = baseName.substring(baseName.lastIndexOf('_') + 1);

    let newFileName = '';

    if (folderPrefix === '二人組' || folderPrefix === '三人組') {
      newFileName = `${unitName}${suffix}`;
    } else if (folderPrefix === '完成') {
      newFileName = `完成${suffix}`;
    } else {
      newFileName = folderPrefix ? `${folderPrefix}${unitName}${suffix}` : `${unitName}${suffix}`;
    }

    return newFileName;
  },
  generateAlbumTitle(outputPath: string): string {
    const basePath = env.OUTPUT_PATH ?? '../output';
    const relativePath = outputPath.startsWith(basePath) 
      ? outputPath.slice(basePath.length + 1)
      : outputPath;

    const parts = relativePath.split('/');
    let folderPrefix = parts.length > 1 ? parts[0] : '';

    if (folderPrefix.endsWith('画像')) {
      folderPrefix = folderPrefix.slice(0, -2);
    } else if (folderPrefix.endsWith('スクショ')) {
      folderPrefix = folderPrefix.slice(0, -4);
    }

    return folderPrefix;
  }
};