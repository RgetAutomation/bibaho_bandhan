import { PrismaClient } from "@prisma/client";
//import mongoose from "mongoose";
//import { config } from "./config";

export const prisma = new PrismaClient();

// const connectDB = async () => {
//   try {
//     mongoose.connection.on("connected", () => {
//       console.log("Database connected!");
//     });

//     mongoose.connection.on("error", (err) => {
//       console.log("Error to connect Database : ", err);
//     });

//     await mongoose.connect(config.databaseUrl as string);
//   } catch (error) {
//     console.log(error);
//     process.exit(1);
//   }
// };

// export const dbConfig = {
//   user: "sa",
//   password: "Raju@0512",
//   server: "LAPTOP-IPC7N8M6\\BETADEBUG", // e.g., "localhost"
//   database: "lightenliftdb",
//   options: {
//     encrypt: true, // Use encryption (true for Azure connections)
//     trustServerCertificate: true, // Required for local dev environments
//   },
// };

//export default connectDB;
