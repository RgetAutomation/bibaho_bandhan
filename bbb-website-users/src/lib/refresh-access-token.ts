import axios from "axios";
import { MAIN_API_URL } from "./constant-data";
import { AxiosResponse } from "@/components/interface/AxiosResponse";
let refreshing = false;

export async function refreshAccessToken(refreshToken: string) {
  if (refreshing) {
    console.log("Already refreshing, skipping...");
    return null;
  }

  refreshing = true;
  try {
    const respose = await axios.get<AxiosResponse<string>>(
      `${MAIN_API_URL}/auth/refresh`,
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );
    return respose.data.data;
  } catch (error) {
    console.log("Error while refreshing access token", error);
    return null;
  } finally {
    refreshing = false;
  }
}
