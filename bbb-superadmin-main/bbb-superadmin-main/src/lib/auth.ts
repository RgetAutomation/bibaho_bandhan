import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware, username } from "better-auth/plugins";
import { prisma } from "./prisma";
import bcrypt from "bcrypt";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  advanced: {
    cookiePrefix: "bbbsuperadmin",
    crossSubDomainCookies: {
      enabled: process.env.NODE_ENV === "production",
      domain:
        process.env.NODE_ENV === "production"
          ? ".bibahobandhan.com"
          : undefined,
    },
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://192.168.1.37:3000",
    "http://192.168.1.37:3001",
    "http://192.168.1.37:3002",
    "https://teamhead.bibahobandhan.com",
    "https://superadmin.bibahobandhan.com",
  ],
  plugins: [username(), nextCookies()],
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    password: {
      hash: async (password) => {
        return await bcrypt.hash(password, 10);
      },
      verify: async ({ hash, password }) => {
        return await bcrypt.compare(password, hash);
      },
    },
  },
  user: {
    modelName: "Team",
    fields: {
      name: "firstName",
      image: "avatar",
    },
    additionalFields: {
      internalId: { type: "number", required: true },
      middleName: { type: "string", required: false },
      lastName: { type: "string", required: true },
      gender: { type: "string", required: true },
      phone: { type: "string", required: true },
      role: {
        type: "string",
        required: true,
      },
    },
    changeEmail: {
      enabled: true,
    },
  },
  account: {
    modelName: "TeamAccount",
  },
  session: {
    modelName: "TeamSession",
  },
  verification: {
    modelName: "TeamVerification",
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/update-user") {
        const body = ctx.body as { username: string } | undefined;
        if (!body?.username) return;

        await prisma.team.update({
          where: { username: body.username },
          data: { phone: body.username },
        });
      }
    }),
  },
});
