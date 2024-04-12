import { object, coerce, string } from "zod";

const EnvSchema = object({
  PORT: coerce.number().default(8080),
  PUBLIC_DIR: string(),
  YOUTUBE_DATA_API_KEY: string(),
  OUTPUT_PATH: string().optional(),
  INSTAGRAM_BUSINESS_ID: string(),
  INSTAGRAM_ACCESS_TOKEN: string(),
});

export const env = EnvSchema.parse(process.env);
