import { env } from '../env';

const albumsUrl = `https://photoslibrary.googleapis.com/v1/albums`;

interface Album {
  title: string;
  id: string;
}

export const googlePhotosUtils = {
  async getAccessToken(): Promise<string> {
    const refreshToken = env.GOOGLE_PHOTOS_REFRESH_TOKEN;
    const clientId = env.GOOGLE_PHOTOS_CLIENT_ID;
    const clientSecret = env.GOOGLE_PHOTOS_CLIENT_SECRET;
    const tokenUrl = `https://oauth2.googleapis.com/token`;

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh access token: ${response.statusText}`);
    }

    const data = await response.json() as { access_token: string };
    return data.access_token;
  },
  async getAlbumByName(albumTitle: string): Promise<string | null> {
    const accessToken = await googlePhotosUtils.getAccessToken();
    const basicHeaders = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
    const listAlbumsResponse = await fetch(albumsUrl, {
      method: 'GET',
      headers: basicHeaders
    });

    if (!listAlbumsResponse.ok) {
      throw new Error(`Failed to list albums: ${listAlbumsResponse.statusText}`);
    }

    const listAlbumsResult = await listAlbumsResponse.json() as { albums: Album[] };
    const album = listAlbumsResult.albums.find((album: any) => album.title === albumTitle);
    return album ? album.id : null;
  },

  async createAlbumIfNotExists(albumTitle: string): Promise<string> {
    let albumId = await googlePhotosUtils.getAlbumByName(albumTitle);
    if (albumId) {
      return albumId;
    }
    const accessToken = await googlePhotosUtils.getAccessToken();
    const basicHeaders = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
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

    const createAlbumResult = await createAlbumResponse.json() as { id: string };
    return createAlbumResult.id;
  },

  async uploadImage(imageBuffer: ArrayBuffer | Buffer, outputPath: string, albumId: string) {
    const newFileName = encodeURIComponent(googlePhotosUtils.generateGooglePhotosFileName(outputPath));
    const uploadUrl = `https://photoslibrary.googleapis.com/v1/uploads`;
    const createMediaItemUrl = `https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate`;
    const accessToken = await googlePhotosUtils.getAccessToken();
    const uploadHeaders = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/octet-stream',
      'X-Goog-Upload-File-Name': newFileName,
      'X-Goog-Upload-Protocol': 'raw'
    };
    const basicHeaders = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
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
  generateGooglePhotosFileName(outputPath: string): string {
    const basePath = env.OUTPUT_PATH ?? '../output';
    const relativePath = outputPath.startsWith(basePath) 
      ? outputPath.slice(basePath.length + 1)
      : outputPath;
    const parts = relativePath.split('/');
    const baseName = parts[parts.length - 1];
    const suffix = baseName.substring(baseName.lastIndexOf('_') + 1);

    return suffix;
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