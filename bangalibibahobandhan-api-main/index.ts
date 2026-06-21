import { config } from "./src/config/config.js";
import { server } from "./src/server.js";
import { autoCloseResolvedTickets } from "./src/controllers/others.controller.js";

const port = config.port || 5000;

const startServer = async () => {
  try {
    server.listen(port, () => {
      console.log(`✅ Server running at http://localhost:${port}`);
    });

    // Run cron job immediately on startup, then every 24 hours
    autoCloseResolvedTickets();
    setInterval(autoCloseResolvedTickets, 24 * 60 * 60 * 1000);
    console.log("⏰ Auto-close cron job scheduled (every 24 hours)");
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
