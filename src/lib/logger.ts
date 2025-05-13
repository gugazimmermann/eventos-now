import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, errors, splat, json, printf, colorize } = format;

const isDev = process.env.NODE_ENV !== 'production';

const devFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf(({ timestamp, level, message, ...meta }) => {
    return `[${timestamp}] ${level}: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta) : ''
    }`;
  })
);

const prodFormat = combine(timestamp(), errors({ stack: true }), splat(), json());

const isEdgeRuntime = typeof process === 'undefined' || process.env.NEXT_RUNTIME === 'edge';

const generalRotateTransport = !isEdgeRuntime
  ? new DailyRotateFile({
      filename: 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info',
    })
  : null;

const authRotateTransport = !isEdgeRuntime
  ? new DailyRotateFile({
      filename: 'logs/auth-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '10m',
      maxFiles: '30d',
      level: 'info',
    })
  : null;

type LogMeta = Record<string, unknown>;

const edgeLogger = {
  info: (message: string, meta?: LogMeta) => console.log(`[INFO] ${message}`, meta),
  warn: (message: string, meta?: LogMeta) => console.warn(`[WARN] ${message}`, meta),
  error: (message: string, meta?: LogMeta) => console.error(`[ERROR] ${message}`, meta),
  debug: (message: string, meta?: LogMeta) => console.debug(`[DEBUG] ${message}`, meta),
};

const logger = isEdgeRuntime
  ? edgeLogger
  : createLogger({
      level: isDev ? 'debug' : 'info',
      format: isDev ? devFormat : prodFormat,
      transports: [
        ...(generalRotateTransport ? [generalRotateTransport] : []),
        ...(isDev ? [new transports.Console()] : []),
      ],
    });

export const authLogger = isEdgeRuntime
  ? edgeLogger
  : createLogger({
      level: isDev ? 'debug' : 'info',
      format: isDev ? devFormat : prodFormat,
      transports: [
        ...(authRotateTransport ? [authRotateTransport] : []),
        ...(isDev ? [new transports.Console()] : []),
      ],
    });

export default logger;
