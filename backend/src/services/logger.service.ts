
const LOG_LEVELS = {
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
};

export class Logger {
  private static formatMessage(level: string, message: string, meta?: any) {
    const timestamp = new Date().toISOString();
    const metaString = meta ? ` ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] [${level}] ${message}${metaString}`;
  }

  static info(message: string, meta?: any) {
    console.log(this.formatMessage(LOG_LEVELS.INFO, message, meta));
  }

  static warn(message: string, meta?: any) {
    console.warn(this.formatMessage(LOG_LEVELS.WARN, message, meta));
  }

  static error(message: string, error?: any) {
    console.error(this.formatMessage(LOG_LEVELS.ERROR, message), error);
  }
}
