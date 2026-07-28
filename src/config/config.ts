import { config } from "dotenv";
import { resolve } from "node:path";

config({path:resolve(`./.env.${process.env.NODE_ENV}`)});

export const PORT = process.env.PORT ?? 7000;

export const DB_URI=process.env.DB_URI as string;

export const IV_LENGTH=parseInt(process.env.IV_LENGTH ?? '16');

export const ENC_SECRET_KEY=process.env.ENC_SECRET_KEY as string;

export const USER_ACCESS_TOKEN_SECRET_KEY=process.env.USER_ACCESS_TOKEN_SECRET_KEY as string;

export const USER_REFRESH_TOKEN_SECRET_KEY=process.env.USER_REFRESH_TOKEN_SECRET_KEY as string;

export const SYSTEM_ACCESS_TOKEN_SECRET_KEY=process.env.SYSTEM_ACCESS_TOKEN_SECRET_KEY as string;

export const SYSTEM_REFRESH_TOKEN_SECRET_KEY=process.env.SYSTEM_REFRESH_TOKEN_SECRET_KEY as string;

export const ACCESS_TOKEN_EXPIRES_IN=parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN ?? "1800")

export const REFRESH_TOKEN_EXPIRES_IN=parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN ?? "1800");

export const REDIS_URI=process.env.REDIS_URI as string;

export const EMAIL_APP_PASSWORD=process.env.EMAIL_APP_PASSWORD as string;

export const EMAIL_APP=process.env.EMAIL_APP as string;

export const APPLICATION_NAME =process.env.APPLICATION_NAME as string;

export const FACEBOOK_LINK=process.env.FACEBOOK_LINK as string;

export const TWITTER_LINK=process.env.TWITTER_LINK as string;

export const INSTEGRAM_LINK=process.env.INSTEGRAM_LINK as string;

export const AUDIENCE=process.env.AUDIENCE as string;

export const AWS_REGION=process.env.AWS_REGION as string;

export const AWS_BUCKET_NAME=process.env.AWS_BUCKET_NAME as string;

export const AWS_ACCESS_KEY_ID=process.env.AWS_ACCESS_KEY_ID as string;

export const AWS_SECRET_ACCESS_KEY=process.env.AWS_SECRET_ACCESS_KEY as string;

export const AWS_EXPIRES_IN=parseInt(process.env.AWS_EXPIRES_IN as string || "120")

export const SALT_ROUND = parseInt(process.env.SALT_ROUND ?? '10')