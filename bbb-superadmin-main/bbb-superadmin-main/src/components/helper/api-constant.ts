export const BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000/api/v1"
    : "https://api.bibahobandhan.com/api/v1";

export const SOCKET_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "https://api.bibahobandhan.com";
