export const MAIN_API_URL =
  process.env.NODE_ENV === "development"
    ? `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:5000/api/v1`
    : "https://api.bibahobandhan.com/api/v1";
//export const MAIN_API_URL="https://bangalibibahobandhan-api.onrender.com/api/v1";

export const SOCKET_URL =
  process.env.NODE_ENV === "development"
    ? `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:5000`
    : "https://api.bibahobandhan.com";

export const MAIN_AUTH_URL =
  process.env.NODE_ENV === "development"
    ? `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:5000`
    : "https://api.bibahobandhan.com";
