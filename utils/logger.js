require("dotenv").config();
require("winston-daily-rotate-file");

const { createLogger, format, transports } = require("winston");
const path = require("path");
const util = require('util');

const logLevel = process.env.LOG_LEVEL || "error";

const { combine, timestamp, label, printf, errors } = format;

const myFormat = printf((info) => {
  return `${info.timestamp} [${info.label}] ${info.level}: ${info.message} ${info.stack ?? ""}`;
});

const transform = (info, opts) => {
  const args = info[Symbol.for('splat')];
  if (args) { info.message = util.format(info.message, ...args); }
  return info;
}

const utilFormatter = () => { return { transform }; }

module.exports = createLogger({
  level: logLevel,
  format: combine(
    errors({ stack: true }), // <-- use errors format
    utilFormatter(),
    label({ label: path.basename(process.mainModule.filename) }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    myFormat
  ),
  transports: [
    new transports.DailyRotateFile({
      filename: "logs/server-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      level: logLevel,
    }),
    new transports.Stream({
      stream: process.stderr,
      level: 'debug',
    })

  ],
});
