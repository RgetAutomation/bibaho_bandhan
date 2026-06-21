"use server";
import axios, { AxiosError } from "axios";
import { AxiosResponse } from "@/types/AxiosResponse";
import { ACCESS_TOKEN_EXPIRES_SECONDS, BASE_URL } from "./constant";

export interface RefreshTokenPayload {
  accessToken: string;
  expiresAt: number;
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<RefreshTokenPayload | null> {
  let isRefreshing = false;
  let refreshQueue: ((token: string) => void)[] = [];

  // Return existing pending request
  if (isRefreshing) {
    return new Promise((resolve) => {
      refreshQueue.push((newToken: string) => {
        resolve({
          accessToken: newToken,
          expiresAt: Date.now() + ACCESS_TOKEN_EXPIRES_SECONDS,
        } as RefreshTokenPayload);
      });
    });
  }
  try {
    isRefreshing = true;
    // Create cookie header with refresh token
    const cookieHeader = `refreshToken=${refreshToken}`;
    const response = await axios.get<AxiosResponse<string>>(
      `${BASE_URL}/auth/system/refresh`,
      {
        headers: {
          Cookie: cookieHeader,
        },
      }
    );

    const refreshedTokens = response.data.data;

    if (!response.data.message) {
      throw refreshedTokens;
    }

    console.log("refreshedTokens at date-now : ", Date.now());

    const newTokens: RefreshTokenPayload = {
      accessToken: refreshedTokens,
      expiresAt: Date.now() + ACCESS_TOKEN_EXPIRES_SECONDS,
    };

    refreshQueue.forEach((cb) => cb(newTokens.accessToken));
    refreshQueue = [];
    return newTokens;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(
      "Refresh token failed:",
      axiosError.response?.data || axiosError.message
    );
    refreshQueue = [];
    return null;
  } finally {
    isRefreshing = false;
  }
}
