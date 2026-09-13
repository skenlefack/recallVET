const { createLogger, format, transports } = require('winston');

const isProduction = process.env.NODE_ENV === 'production';

const logger = createLogger({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  format: isProduction
    ? format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json()
      )
    : format.combine(
        format.timestamp({ format: 'HH:mm:ss' }),
        format.errors({ stack: true }),
        format.colorize(),
        format.printf(({ timestamp, level, message, stack, ...meta }) => {
          let msg = `${timestamp} ${level}: ${message}`;
          if (stack) msg += `\n${stack}`;
          const metaKeys = Object.keys(meta);
          if (metaKeys.length > 0) msg += ` ${JSON.stringify(meta)}`;
          return msg;
        })
      ),
  transports: [
    new transports.Console()
  ],
  exitOnError: false
});

module.exports = logger;
