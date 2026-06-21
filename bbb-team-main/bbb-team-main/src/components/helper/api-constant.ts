export const SOCKET_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "https://api.bibahobandhan.com";

export const SYSTEM_ACCESS_TOKEN = "systemAccessToken";
export const SYSTEM_REFRESH_TOKEN = "systemRefreshToken";
