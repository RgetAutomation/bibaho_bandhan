import { PaginationResponse } from "@/components/interface/AxiosResponse";
import { AllUsers } from "@/components/interface/user";
import { MAIN_API_URL } from "@/lib/constant-data";
import axios from "axios";

import z from "zod";

export const GetUsersParamsSchema = z.object({
  //token: z.string(),
  page: z.number().optional(),
  limit: z.number().optional(),
});
export type GetUsersOptions = z.infer<typeof GetUsersParamsSchema>;

export const getUsers = async (options?: GetUsersOptions) => {
  const { page, limit } = options ? options : {};
  const queryParams = new URLSearchParams();

  if (limit) queryParams.append("limit", limit.toString());
  if (page) queryParams.append("page", page.toString());
  const queryString = queryParams.toString();

  console.log("queryString", queryString);

  const response = await axios.get<PaginationResponse<AllUsers>>(
    `${MAIN_API_URL}/users/profiles${queryString ? `?${queryString}` : ""}`
  );

  console.log("response", response.data);

  const data = response.data.data;
  return data;
};
