// lib/axiosInstance.ts
import axios from "axios";
import { MAIN_API_URL } from "./constant-data";

const api = axios.create({
  baseURL: MAIN_API_URL,
  withCredentials: true,
});

// Flag to prevent multiple refresh calls simultaneously
// let isRefreshing = false;
// let refreshSubscribers: ((token: string) => void)[] = [];

// function subscribeTokenRefresh(cb: (token: string) => void) {
//   refreshSubscribers.push(cb);
// }

// function onRefreshed(token: string) {
//   refreshSubscribers.forEach((cb) => cb(token));
//   refreshSubscribers = [];
// }

// api.interceptors.request.use(async (config) => {
//   const session = await getSession();
//   const accessToken = session?.user?.accessToken;

//   if (accessToken && config.headers) {
//     config.headers["Authorization"] = `Bearer ${accessToken}`;
//   }
//   return config;
// });

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // If unauthorized and we haven’t retried yet
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       if (isRefreshing) {
//         // Wait for the token to refresh and then retry
//         return new Promise((resolve) => {
//           subscribeTokenRefresh((token) => {
//             originalRequest.headers["Authorization"] = `Bearer ${token}`;
//             resolve(api(originalRequest));
//           });
//         });
//       }

//       isRefreshing = true;
//       const session = await getSession();
//       const refreshToken = session?.user?.refreshToken;
//       try {
//         const refreshResponse = await axios.post<AxiosResponse<string>>(
//           `${MAIN_API_URL}/auth/refresh`,
//           { headers: { Authorization: `Bearer ${refreshToken}` } },
//           { withCredentials: true }
//         );

//         const newAccessToken = refreshResponse.data?.data;
//         if (!newAccessToken) throw new Error("No new token received");

//         // 🔄 Update NextAuth session in memory
//         await axios.post("/api/auth/update/session", {
//           accessToken: newAccessToken,
//         });

//         // Retry failed requests
//         onRefreshed(newAccessToken);
//         originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
//         return api(originalRequest);
//       } catch (refreshError) {
//         console.error("Token refresh failed:", refreshError);
//         await signOut(); // Logout if refresh fails
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// let isRefreshing = false;
// let failedQueue: {
//   resolve: (value?: unknown) => void;
//   reject: (error: unknown) => void;
//   config: AxiosRequestConfig;
// }[] = [];

// const processQueue = (error: unknown, token: string | null = null) => {
//   failedQueue.forEach((prom) => {
//     if (error) {
//       prom.reject(error);
//     } else if (token && prom.config.headers) {
//       prom.config.headers["Authorization"] = `Bearer ${token}`;
//       prom.resolve(axios(prom.config));
//     }
//   });
//   failedQueue = [];
// };

// api.interceptors.response.use(
//   (response) => response,
//   async (error: AxiosError) => {
//     const originalRequest = error.config as AxiosRequestConfig & {
//       _retry?: boolean;
//     };

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject, config: originalRequest });
//         });
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       try {
//         const { data } = await axios.get(`${MAIN_API_URL}/auth/refresh`, {
//           withCredentials: true,
//         });

//         const newAccessToken = data.data || data.accessToken; // ApiResponse shape

//         processQueue(null, newAccessToken);

//         if (originalRequest.headers) {
//           originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
//         }

//         return api(originalRequest);
//       } catch (err) {
//         processQueue(err, null);
//         // 🚨 Refresh failed → logout user
//         handleLogout();
//         return Promise.reject(err);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(error);
//   }
// );

export default api;
