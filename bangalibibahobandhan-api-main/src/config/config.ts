import { config as conf } from "dotenv";
conf();

const _config = {
  port: process.env.PORT,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  systemAccessToken: process.env.SYSTEM_ACCESS_TOKEN_SECRET,
  systemRefreshToken: process.env.SYSTEM_REFRESH_TOKEN_SECRET,
};

export const config = Object.freeze(_config);
