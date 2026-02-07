// Production Logger Utility
// Console.log ni production da to'g'ri logging bilan almashtirish

interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
};

class Logger {
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  error(message: string, error?: any): void {
    const formatted = this.formatMessage(LOG_LEVELS.ERROR, message, error);
    console.error(formatted);
  }

  warn(message: string, meta?: any): void {
    const formatted = this.formatMessage(LOG_LEVELS.WARN, message, meta);
    console.warn(formatted);
  }

  info(message: string, meta?: any): void {
    const formatted = this.formatMessage(LOG_LEVELS.INFO, message, meta);
    console.log(formatted);
  }

  debug(message: string, meta?: any): void {
    // Production da debug loglarni ko'rsatmaslik
    if (!this.isProduction) {
      const formatted = this.formatMessage(LOG_LEVELS.DEBUG, message, meta);
      console.log(formatted);
    }
  }

  // HTTP request logging
  request(method: string, url: string, statusCode: number, duration: number): void {
    const message = `${method} ${url} ${statusCode} - ${duration}ms`;
    if (statusCode >= 500) {
      this.error(message);
    } else if (statusCode >= 400) {
      this.warn(message);
    } else {
      this.info(message);
    }
  }
}

export default new Logger();
