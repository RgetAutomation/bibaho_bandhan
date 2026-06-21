import { APIError, betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware, username } from "better-auth/plugins";
import bcrypt from "bcrypt";
import { prisma } from "./prisma";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  advanced: {
    crossSubDomainCookies: {
      enabled: process.env.NODE_ENV === "production",
      domain:
        process.env.NODE_ENV === "production"
          ? "bibahobandhan.com"
          : undefined,
    },
  },
  trustedOrigins: [
    "http://localhost:5000",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://192.168.0.101:3000",
    "http://192.168.0.101:3001",
    "http://192.168.0.111:3000",
    "http://192.168.0.111:3001",
    "https://api.bibahobandhan.com",
    "https://team.bibahobandhan.com",
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
        input: false,
      },
      isProfileComplete: {
        type: "boolean",
        required: false,
        input: false,
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
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-in/username" || ctx.path === "/sign-in/email") {
        const body = ctx.body as
          | { email?: string; username?: string }
          | undefined;
        if (!body) return;

        const { email, username } = body;
        if (!email && !username) return;
        // Fetch the team member
        const team = await prisma.team.findUniqueOrThrow({
          where: email ? { email } : { username },
          select: {
            blocked: true,
          },
        });

        if (team?.blocked === true) {
          throw new APIError("FORBIDDEN", {
            message: "Account has been blocked",
          });
        }
      }
    }),
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
