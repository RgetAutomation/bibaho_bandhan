import { config } from "./src/config/config.js";
import { server } from "./src/server.js";
//import express from "express";
// import { toNodeHandler } from "better-auth/node";
// import { auth } from "./src/utils/auth.js";

const port = config.port || 5000;

const startServer = async () => {
  // Handle auth
  //const app = express();
  try {
    server.listen(port, () => {
      console.log(`✅ Server running at http://localhost:${port}`);
    });
    //app.all("/api/auth/*splat", toNodeHandler(auth));
    // app.listen(port, () => {
    //   console.log(`✅ Server running at http://localhost:${port}`);
    // });
  } catch (error) {
    if ((error as any).code === "EADDRINUSE") {
      console.error(`❌ Port ${port} is already in use.`);
      process.exit(1);
    } else {
      console.error("Server start error:", error);
      process.exit(1);
    }
  }
};

startServer();
