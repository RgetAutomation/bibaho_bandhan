import { createAuthClient } from "better-auth/react";
import { MAIN_AUTH_URL } from "./constant-data";
import { usernameClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: MAIN_AUTH_URL,
  plugins: [usernameClient()],
  user: {
    additionalFields: {
      title: { type: "string" },
      middleName: { type: "string" },
      lastName: { type: "string" },
      gender: { type: "string" },
      phone: { type: "string" },
      hasUsedFreePlan: { type: "boolean" },
      activePlanId: { type: "string" },
    },
  },
});
