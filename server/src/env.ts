import { object, coerce, string } from "zod";

const EnvSchema = object({
  PORT: coerce.number().default(8080),
  CORS_ORIGIN: string(),
  PUBLIC_DIR: string(),
  YOUTUBE_DATA_API_KEY: string(),
  GOOGLE_PHOTOS_CLIENT_ID: string(),
  GOOGLE_PHOTOS_CLIENT_SECRET: string(),
  GOOGLE_PHOTOS_REFRESH_TOKEN: string(),
  OUTPUT_PATH: string().optional(),
  INSTAGRAM_BUSINESS_ID: string(),
  INSTAGRAM_ACCESS_TOKEN: string(),
  S3_ENDPOINT: string(),
  S3_BUCKET: string(),
  S3_ACCESS_KEY: string(),
  S3_SECRET_KEY: string(),
  S3_REGION: string(),
  USER_NAME: string(),
  PASSWORD: string(),
});

export const env = EnvSchema.parse(process.env);
