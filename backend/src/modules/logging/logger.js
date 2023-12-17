const winston = require("winston");
const { combine, timestamp, json, printf } = winston.format;
require("winston-daily-rotate-file");

const combinedFileTransport = new winston.transports.DailyRotateFile({
	format: combine(
		timestamp({
			format: "YYYY-MM-DD HH:mm:ss.SSS"
		}),
		json()
	),
	filename: __dirname + "/../../../storage/logs/combined-%DATE%.log",
	dirname: __dirname + "/../../../storage/logs/",
	datePattern: "YYYY-WW",
	maxFiles: "4w"
});

const errorFileTransport = new winston.transports.DailyRotateFile({
	level: "error",
	format: combine(
		timestamp({
			format: "YYYY-MM-DD HH:mm:ss.SSS"
		}),
		json()
	),
	filename: __dirname + "/../../../storage/logs/error-%DATE%.log",
	dirname: __dirname + "/../../../storage/logs/",
	datePattern: "YYYY-WW",
	maxFiles: "4w"
});

const logger = winston.createLogger({
	level: "http",
	transports: [
		new winston.transports.Console({
			format: combine(
				timestamp({
					format: "YYYY-MM-DD HH:mm:ss.SSS"
				}),
				printf((info) => {
					return `[${info.timestamp}] ${info.level}: ${info.message}`;
				})
			)
		}),
		combinedFileTransport,
		errorFileTransport
	]
});

const emailFileTransport = new winston.transports.DailyRotateFile({
	format: combine(
		timestamp({
			format: "YYYY-MM-DD HH:mm:ss.SSS"
		}),
		json()
	),
	filename: __dirname + "/../../../storage/logs/email-%DATE%.log",
	dirname: __dirname + "/../../../storage/logs/",
	datePattern: "YYYY-WW",
	maxFiles: "4w"
});

const emailLogger = winston.createLogger({
	level: "http",
	transports: [
		new winston.transports.Console({
			format: combine(
				timestamp({
					format: "YYYY-MM-DD HH:mm:ss.SSS"
				}),
				printf((info) => {
					return `[${info.timestamp}] ${info.level}: ${info.message}`;
				})
			)
		}),
		emailFileTransport
	]
});

module.exports = {logger, emailLogger};
