"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const env_1 = require("../config/env");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Helper to create DailyRotateFile transport
const createRotateFile = (options) => {
    return new winston_daily_rotate_file_1.default(options);
};
// Create logs directory if it doesn't exist
// Use environment variable directly to avoid circular dependency
const logsDir = path_1.default.join(process.cwd(), process.env.LOG_DIR || 'logs');
if (!fs_1.default.existsSync(logsDir)) {
    fs_1.default.mkdirSync(logsDir, { recursive: true });
}
/**
 * Log levels
 */
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
/**
 * Log level colors
 */
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
winston_1.default.addColors(colors);
/**
 * Custom log format for console (development)
 */
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
/**
 * Custom log format for files (production)
 */
const fileFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
/**
 * Determine log level based on environment
 */
const level = () => {
    const env = env_1.config.nodeEnv || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'warn';
};
/**
 * Transports for different log levels
 */
const transports = [
    // Console transport (always enabled)
    new winston_1.default.transports.Console({
        format: env_1.config.nodeEnv === 'production' ? fileFormat : consoleFormat,
    }),
    // Error log file (only errors)
    createRotateFile({
        filename: path_1.default.join(logsDir, 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        format: fileFormat,
        maxSize: '20m',
        maxFiles: '14d',
        zippedArchive: true,
    }),
    // Combined log file (all levels)
    createRotateFile({
        filename: path_1.default.join(logsDir, 'combined-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        format: fileFormat,
        maxSize: '20m',
        maxFiles: '14d',
        zippedArchive: true,
    }),
];
/**
 * Create Winston logger instance with error handling
 */
let logger;
try {
    exports.logger = logger = winston_1.default.createLogger({
        level: level(),
        levels,
        format: fileFormat,
        transports,
        // Handle exceptions and rejections
        exceptionHandlers: [
            createRotateFile({
                filename: path_1.default.join(logsDir, 'exceptions-%DATE%.log'),
                datePattern: 'YYYY-MM-DD',
                format: fileFormat,
                maxSize: '20m',
                maxFiles: '14d',
                zippedArchive: true,
            }),
        ],
        rejectionHandlers: [
            createRotateFile({
                filename: path_1.default.join(logsDir, 'rejections-%DATE%.log'),
                datePattern: 'YYYY-MM-DD',
                format: fileFormat,
                maxSize: '20m',
                maxFiles: '14d',
                zippedArchive: true,
            }),
        ],
    });
}
catch (error) {
    // Fallback to console logger if file logger fails
    console.error('Failed to initialize file logger:', error);
    exports.logger = logger = winston_1.default.createLogger({
        level: level(),
        levels,
        format: fileFormat,
        transports: [
            new winston_1.default.transports.Console({
                format: env_1.config.nodeEnv === 'production' ? fileFormat : consoleFormat,
            }),
        ],
    });
}
/**
 * Logger utility functions
 */
exports.log = {
    /**
     * Log error message
     */
    error: (message, meta) => {
        logger.error(message, meta);
    },
    /**
     * Log warning message
     */
    warn: (message, meta) => {
        logger.warn(message, meta);
    },
    /**
     * Log info message
     */
    info: (message, meta) => {
        logger.info(message, meta);
    },
    /**
     * Log HTTP request
     */
    http: (message, meta) => {
        logger.http(message, meta);
    },
    /**
     * Log debug message
     */
    debug: (message, meta) => {
        logger.debug(message, meta);
    },
};
//# sourceMappingURL=logger.js.map