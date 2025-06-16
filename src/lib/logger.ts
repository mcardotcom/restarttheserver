/**
 * Logging utility for the application
 * Provides different log levels and error tracking capabilities
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: unknown
  error?: Error
}

class Logger {
  private static instance: Logger
  private isDevelopment: boolean
  private logs: LogEntry[] = []
  private readonly maxLogs: number = 1000

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  /**
   * Get the singleton instance of the logger
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private formatLogEntry(entry: LogEntry): string {
    const { timestamp, level, message, data, error } = entry
    let logString = `[${timestamp}] ${level.toUpperCase()}: ${message}`
    
    if (data) {
      logString += `\nData: ${JSON.stringify(data, null, 2)}`
    }
    
    if (error) {
      logString += `\nError: ${error.message}\nStack: ${error.stack}`
    }
    
    return logString
  }

  /**
   * Log a debug message
   * @param message - The message to log
   * @param data - Optional data to include with the log
   */
  public debug(message: string, data?: unknown): void {
    this.log('debug', message, data)
  }

  /**
   * Log an info message
   * @param message - The message to log
   * @param data - Optional data to include with the log
   */
  public info(message: string, data?: unknown): void {
    this.log('info', message, data)
  }

  /**
   * Log a warning message
   * @param message - The message to log
   * @param data - Optional data to include with the log
   */
  public warn(message: string, data?: unknown): void {
    this.log('warn', message, data)
  }

  /**
   * Log an error message
   * @param message - The message to log
   * @param error - The error object
   * @param data - Optional data to include with the log
   */
  public error(message: string, error?: Error, data?: unknown): void {
    this.log('error', message, data, error)
    
    // In production, you might want to send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.trackError(message, error, data)
    }
  }

  /**
   * Get all logs
   * @returns Array of log entries
   */
  public getLogs(): LogEntry[] {
    return this.logs
  }

  /**
   * Clear all logs
   */
  public clearLogs(): void {
    this.logs = []
  }

  /**
   * Internal logging method
   */
  private log(level: LogLevel, message: string, data?: unknown, error?: Error): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      error,
    }

    const formattedLog = this.formatLogEntry(entry)

    // In development, log to console with colors
    if (this.isDevelopment) {
      const colors = {
        debug: '\x1b[36m', // Cyan
        info: '\x1b[32m',  // Green
        warn: '\x1b[33m',  // Yellow
        error: '\x1b[31m'  // Red
      }
      console.log(`${colors[level]}${formattedLog}\x1b[0m`)
    } else {
      // In production, log to console without colors
      console.log(formattedLog)
    }

    this.logs.unshift(entry)
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    // TODO: In production, you might want to send logs to a service like Sentry, LogRocket, etc.
  }

  /**
   * Track errors in production
   * This is where you would integrate with error tracking services like Sentry
   */
  private trackError(message: string, error?: Error, data?: unknown): void {
    // TODO: Implement error tracking service integration
    // Example: Sentry.captureException(error, { extra: { message, data } })
  }
}

// Export a singleton instance
export const logger = Logger.getInstance() 