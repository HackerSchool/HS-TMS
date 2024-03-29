const winston = require("winston");
const { combine, timestamp, json, printf } = winston.format;

const combinedFileTransport = new winston.transports.File({
  filename: __dirname + "/../../../storage/logs/combined.log",
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss.SSS",
    }),
    json(),
  ),
});

const errorFileTransport = new winston.transports.File({
  level: "error",
  filename: __dirname + "/../../../storage/logs/error.log",
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss.SSS",
    }),
    json(),
  ),
});

const logger = winston.createLogger({
  level: "http",
  transports: [
    new winston.transports.Console({
      format: combine(
        timestamp({
          format: "YYYY-MM-DD HH:mm:ss.SSS",
        }),
        printf((info) => {
          return `[${info.timestamp}] ${info.level}: ${info.message}`;
        }),
      ),
    }),
    combinedFileTransport,
    errorFileTransport,
  ],
});

function logInfo(functionPath, message, prefix = null) {
  logger.info(`${prefix ? `[${prefix}] ` : ""}@ ${functionPath}: ${message}`);
}

function logError(functionPath, message, prefix = null) {
  logger.error(`${prefix ? `[${prefix}] ` : ""}@ ${functionPath}: ${message}`);
}

const emailFileTransport = new winston.transports.File({
  filename: __dirname + "/../../../storage/logs/email.log",
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss.SSS",
    }),
    json(),
  ),
});

const emailLogger = winston.createLogger({
  level: "http",
  transports: [
    new winston.transports.Console({
      format: combine(
        timestamp({
          format: "YYYY-MM-DD HH:mm:ss.SSS",
        }),
        printf((info) => {
          return `[${info.timestamp}] ${info.level}: [Change] ${info.message}`;
        }),
      ),
    }),
    emailFileTransport,
  ],
});

function emailLoggerFn(author, resource, method, before, after) {
  emailLogger.info(
    JSON.stringify({
      author,
      resource,
      method,
      before,
      after,
    }),
  );
}

module.exports = { logger, emailLoggerFn, logInfo, logError };
