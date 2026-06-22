import { APIError, betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins";
import bcrypt from "bcrypt";
import { prisma } from "../config/db.js";
import { Gender } from "../types/gender.js";
import { UserType } from "../types/user-type.js";
import { createAuthMiddleware } from "better-auth/api";

export const authTeam = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://192.168.0.101:3000",
    "https://bibahobandhan.com",
    "https://www.bibahobandhan.com",
    "https://team.bibahobandhan.com",
    "https://teamhead.bibahobandhan.com",
  ],
  plugins: [username()],
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
      blocked: {
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
  // 🧩 add hook here
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      const isEmailLogin = ctx.path.includes("/api/auth/sign-in/email");
      const isUsernameLogin = ctx.path.includes("/api/auth/sign-in/username");

      if (!isEmailLogin && !isUsernameLogin) return;

      // Safe access to request body
      const body = ctx.request?.body as
        | { email?: string; username?: string }
        | undefined;
      if (!body) return;

      const { email, username } = body;
      if (!email && !username) return;

      // Fetch the team member
      const team = await prisma.team.findUnique({
        where: email ? { email } : { username },
        select: { blocked: true },
      });

      if (team?.blocked) {
        throw new APIError("FORBIDDEN", {
          message: "Your account has been blocked. Please contact support.",
        });
      }
    }),
  },
});

export const authSuperAdmin = betterAuth({
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
    "http://192.168.0.101:3000",
    "https://bibahobandhan.com",
    "https://www.bibahobandhan.com",
    "https://team.bibahobandhan.com",
    "https://teamhead.bibahobandhan.com",
  ],
  plugins: [username()],
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
      role: { type: "string", required: true, input: false },
      isProfileComplete: { type: "boolean", required: false, input: false },
      blocked: { type: "boolean", required: false, input: false },
    },
  },
  account: { modelName: "TeamAccount" },
  session: { modelName: "TeamSession" },
  verification: { modelName: "TeamVerification" },
});

export const authUser = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [username()],
  advanced: {
    cookiePrefix: "bbbuser",
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
    "http://192.168.0.101:3000",
    "https://bibahobandhan.com",
    "https://www.bibahobandhan.com",
  ],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 50,
    autoSignIn: true,
    resetPasswordTokenExpiresIn: 3600, // 1 hour
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
    modelName: "User",
    fields: {
      name: "firstName",
      image: "avatar",
    },
    additionalFields: {
      title: { type: "string", required: true, input: true },
      publicId: { type: "string", required: false, unique: true },
      middleName: { type: "string", required: false },
      lastName: { type: "string", required: true },
      gender: { type: "string", required: true },
      phone: { type: "string", required: true, unique: true },
      type: {
        type: "string",
        required: false,
        input: false,
      },
      blocked: {
        type: "boolean",
        required: false,
        input: false,
      },
      isProfileComplete: {
        type: "boolean",
        required: false,
        input: false,
      },
      verificationStatus: {
        type: "string",
        required: false,
        input: false,
      },
      hasUsedFreePlan: {
        type: "boolean",
        required: false,
        input: false,
      },
      activePlanId: {
        type: "string",
        required: false,
        input: false,
      },
      isGhotokOwned: {
        type: "boolean",
        required: false,
        input: false,
      },
      isProfilePublic: {
        type: "boolean",
        required: false,
        input: false,
      },
      allowSocialPublish: {
        type: "boolean",
        required: false,
        input: false,
      },
      totalLimit: {
        type: "number",
        required: false,
        input: false,
      },
      remainingLimit: {
        type: "number",
        required: false,
        input: false,
      },
      planStartDate: {
        type: "date",
        required: false,
        input: false,
      },
      planExpiryDate: {
        type: "date",
        required: false,
        input: false,
      },
      matchingStartDate: {
        type: "date",
        required: false,
        input: false,
      },
      matchingExpiryDate: {
        type: "date",
        required: false,
        input: false,
      },
    },
  },
  account: {
    modelName: "UserAccount",
  },
  session: {
    modelName: "UserSession",
  },
  verification: {
    modelName: "UserVerification",
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Safe access to request body
      const body = ctx?.body as { username?: string } | undefined;
      if (!body) return;

      const { username } = body;
      if (!username) return;

      // Fetch the user member
      const user = await prisma.user.findUnique({
        where: { username },
        select: { blocked: true },
      });

      if (user?.blocked) {
        throw new APIError("FORBIDDEN", {
          message: "Account has been blocked.",
        });
      }
    }),

    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/username" || ctx.path === "/sign-up/email") {
        // Find user by username
        const { username, gender } = ctx.body;

        let userType = UserType.FREE_USER;
        let userPlanExpiryDate = new Date();
        let totalLimit = 0;
        let remainingLimit = 0;

        if (gender === Gender.FEMALE) {
          userType = UserType.PAID_USER;
          userPlanExpiryDate = new Date(new Date().setFullYear(new Date().getFullYear() + 5));
        } else {
          // For Males: Look for an active Free Plan (price "0" or title contains "FREE")
          const freePlan = await prisma.plan.findFirst({
            where: {
              status: true,
              OR: [
                { price: "0" },
                { title: { contains: "FREE", mode: "insensitive" } }
              ]
            }
          });

          if (freePlan) {
            userType = UserType.PAID_USER; // Grant full access like a paid plan
            totalLimit = parseInt(freePlan.connection) || 0;
            remainingLimit = parseInt(freePlan.connection) || 0;
            
            const durationDays = parseInt(freePlan.duration) || 0;
            userPlanExpiryDate = new Date();
            userPlanExpiryDate.setDate(userPlanExpiryDate.getDate() + durationDays);
          }
        }

        // Generate unique custom ID
        let customId = generateUniqueId();
        let exists = await prisma.user.findUnique({
          where: { publicId: customId },
          select: { id: true },
        });

        // Ensure uniqueness by regenerating if exists
        while (exists) {
          customId = generateUniqueId();
          exists = await prisma.user.findUnique({
            where: { publicId: customId },
            select: { id: true },
          });
        }

        //Generate Internal Id
        await prisma.user.updateMany({
          where: { username },
          data: {
            publicId: customId,
            type: userType,
            planExpiryDate: userPlanExpiryDate,
            totalLimit: totalLimit,
            remainingLimit: remainingLimit,
          },
        });

        if (userType === UserType.PAID_USER) {
          try {
            await prisma.$executeRawUnsafe(`UPDATE "User" SET "hasUsedFreePlan" = true WHERE "username" = $1`, username);
          } catch (e) {
            console.error("Failed to set hasUsedFreePlan in raw query", e);
          }
        }
      }
    }),
  },
});

function generateUniqueId(): string {
  // Prefix "NOA" + random 6-digit number
  const randomPart = Math.floor(10000000 + Math.random() * 90000000);
  return `BBB${randomPart}`;
}
