// lib/axiosInstance.ts
import { BASE_URL } from "@/components/helper/constant";
import axios, { AxiosError, AxiosRequestConfig } from "axios";

//let accessToken: string | null = null;
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (error: unknown) => void;
  config: AxiosRequestConfig;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      if (token && prom.config.headers) {
        prom.config.headers["Authorization"] = `Bearer ${token}`;
      }
      prom.resolve(axios(prom.config));
    }
  });
  failedQueue = [];
};

// export const setTokens = (at: string) => {
//   accessToken = at;
// };

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// api.interceptors.request.use((config) => {
//   if (accessToken && config.headers) {
//     config.headers["Authorization"] = `Bearer ${accessToken}`;
//   }
//   return config;
// });

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    console.log("error", error.response);

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.get(`${BASE_URL}/auth/system/refresh`, {
          withCredentials: true,
        });

        const newAccessToken = data.accessToken;
        //accessToken = newAccessToken;

        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        }

        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
