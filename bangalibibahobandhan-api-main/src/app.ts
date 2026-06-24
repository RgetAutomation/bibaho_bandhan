import express, { Response, Request } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import ApiResponse from "./utils/ApiResponse.js";
import userRoute from "./routes/user.route.js";
import adminRoute from "./routes/admin.route.js";
import discountRoute from "./routes/discount.route.js";
import couponRoute from "./routes/coupon.route.js";
import authRoute from "./routes/auth.route.js";
import ghotokRoute from "./routes/ghotok.route.js";
import superAdminRoute from "./routes/superadmin.route.js";
import othersRoute from "./routes/others.route.js";
import moderatorRoute from "./routes/moderator.route.js";
import conversationsRoute from "./routes/conversations.route.js";
import broadcastRoute from "./routes/broadcast.route.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { authUser } from "./utils/auth.js";
import asyncHandler from "./utils/asyncHandler.js";

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://192.168.0.101:3000",
      "http://192.168.97.1:3000",
      "http://192.168.1.37:3000",
      "http://192.168.1.37:3001",
      "http://192.168.1.37:3002",
      "https://bibahobandhan.com",
      "https://www.bibahobandhan.com",
      "https://team.bibahobandhan.com",
      "https://teamhead.bibahobandhan.com",
      "https://superadmin.bibahobandhan.com",
    ],
    credentials: true,
  })
);

// Handle auth
app.all("/api/auth/*splat", toNodeHandler(authUser));

app.get(
  "/api/me",
  asyncHandler(async (req: Request, res: Response) => {
    const session = await authUser.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    res.json(
      new ApiResponse(200, "Welcome to the Bangali Bibaho Bandhan API", session)
    );
  })
);

app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(express.static("public"));

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // limit each IP to 1000 requests per windowMs to allow dev/polling
});
app.use(limiter);

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");
//   next();
// });

app.get("/", (_req, res: Response) => {
  res.json(
    new ApiResponse(200, "Welcome to the Bangali Bibaho Bandhan API", null)
  );
});

// app.use((req: Request, _res, next: NextFunction) => {
//   req.io = io;
//   req.socketUserMap = io.socketUserMap; // ✅ here
//   next();
// });

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// User Routes
app.use("/api/v1/users", userRoute);

// Auth Routes
app.use("/api/v1/auth", authRoute);

//Admin Routes
app.use("/api/v1/app/admin", adminRoute);

// Moderator Routes
app.use("/api/v1/app/moderator", moderatorRoute);

// Ghotok Routes
app.use("/api/v1/app/ghotok", ghotokRoute);

//Super Admin Routes
app.use("/api/v1/app/sa", superAdminRoute);

//Conversation Routes
app.use("/api/v1/conversations", conversationsRoute);

// Broadcast Routes
app.use("/api/v1/broadcasts", broadcastRoute);

// Discount Routes
app.use("/api/v1/discounts", discountRoute);

// Coupon Routes
app.use("/api/v1/coupons", couponRoute);

// Others Routes
app.use("/api/v1/other", othersRoute);

export default app;
