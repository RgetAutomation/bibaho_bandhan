"use server";
import { BASE_URL } from "@/components/helper/constant";
import { AxiosResponse } from "@/types/AxiosResponse";
import { SystemUser } from "@/types/SystemUser";
import axios from "axios";

async function getSession() {
  try {
    const res = await axios.get<AxiosResponse<SystemUser>>(
      `${BASE_URL}/auth/session`,
      {
        withCredentials: true,
      }
    );
    console.log("getSession", res.data);

    return res.data.data; // or null if 401
  } catch (error) {
    console.log("getSession error", error);

    return null;
  }
}
