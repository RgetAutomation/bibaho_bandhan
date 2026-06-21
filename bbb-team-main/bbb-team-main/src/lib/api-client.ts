import { BASE_URL } from "@/components/helper/constant";
import axios, { AxiosInstance } from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: BASE_URL || "",
      withCredentials: true, // Important for cross-origin requests with cookies
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add tokens
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const { accessToken } = await this.getTokenFromCookies();

        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Add all cookies to the request
        const cookieStore = await cookies();
        const allCookies = cookieStore.getAll();
        const cookieHeader = allCookies
          .map((cookie) => `${cookie.name}=${cookie.value}`)
          .join("; ");

        if (cookieHeader) {
          config.headers.Cookie = cookieHeader;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    // this.axiosInstance.interceptors.response.use(
    //   (response: AxiosResponse) => {
    //     return response;
    //   },
    //   async (error: AxiosError) => {
    //     const originalRequest = error.config as any;

    //     if (error.response?.status === 401 && !originalRequest._retry) {
    //       originalRequest._retry = true;

    //       try {
    //         const { refreshToken } = await this.getTokenFromCookies();

    //         if (refreshToken) {
    //           const newAccessToken = await this.refreshToken(refreshToken);

    //           if (newAccessToken) {
    //             // Update the original request with new token
    //             originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
    //             return this.axiosInstance(originalRequest);
    //           }
    //         }
    //       } catch (refreshError) {
    //         console.error("Token refresh failed:", refreshError);
    //         this.clearTokensAndRedirect();
    //       }
    //     }

    //     return Promise.reject(error);
    //   }
    // );
  }

  private async getTokenFromCookies() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    return { accessToken, refreshToken };
  }

  private async refreshToken(refreshToken: string): Promise<string | null> {
    try {
      const response = await axios.post(
        `${process.env.API_BASE_URL}/auth/refresh`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Cookie: `refreshToken=${refreshToken}`,
          },
          withCredentials: true,
        }
      );

      const data = response.data;

      // Update cookies with new tokens
      const cookieStore = await cookies();
      cookieStore.set("accessToken", data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      if (data.refreshToken) {
        cookieStore.set("refreshToken", data.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 30,
          path: "/",
        });
      }

      return data.accessToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      this.clearTokensAndRedirect();
      return null;
    }
  }

  private async clearTokensAndRedirect() {
    const cookieStore = await cookies();
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
    redirect("/login");
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await this.axiosInstance.get<T>(endpoint);
    return response.data;
  }

  async post<T>(endpoint: string, data?: T): Promise<T> {
    const response = await this.axiosInstance.post<T>(endpoint, data);
    return response.data;
  }

  async put<T>(endpoint: string, data?: T): Promise<T> {
    const response = await this.axiosInstance.put<T>(endpoint, data);
    return response.data;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.axiosInstance.delete<T>(endpoint);
    return response.data;
  }

  async patch<T>(endpoint: string, data?: T): Promise<T> {
    const response = await this.axiosInstance.patch<T>(endpoint, data);
    return response.data;
  }
}
