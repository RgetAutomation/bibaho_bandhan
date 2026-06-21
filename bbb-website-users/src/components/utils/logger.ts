// utils/Logger.ts

type LogArg = string | number | boolean | object | undefined | null;

export class Logger {
  private static readonly isDev = process.env.NODE_ENV === "development";

  static info(...args: LogArg[]): void {
    if (this.isDev) console.log("🟢 [INFO]:", ...args);
  }

  static warn(...args: LogArg[]): void {
    if (this.isDev) console.warn("🟠 [WARN]:", ...args);
  }

  static error(...args: LogArg[]): void {
    if (this.isDev) console.error("🔴 [ERROR]:", ...args);
  }

  static socket(...args: LogArg[]): void {
    if (this.isDev) console.log("📡 [SOCKET]:", ...args);
  }
}
