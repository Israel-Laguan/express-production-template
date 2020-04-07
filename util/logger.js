const { createLogger, format, transports } = require('winston')
const fs = require('fs')

const level = process.env.LOG_LEVEL || 'debug'
const logDir = 'logs'

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir)
}

const logger = createLogger({
  level: level,
  format: format.combine(
    format(info => {
      info.level = info.level.toUpperCase()
      return info
    })(),
    format.colorize({ all: true }),
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm'
    }),
    format.align(),
    format.splat(),
    format.printf(info => {
      const { timestamp, label, level, group, message, ...args } = info
      return `${timestamp}${label ? ` [${label}] ` : ' '}[${level}]:${
        group ? ` [${group}] ` : ' '
      }${message} ${
        Object.keys(args).length ? JSON.stringify(args, null, 2) : ''
      }`
    })
  ),
  transports: [
    new transports.File({
      filename: `${logDir}/server.log`,
      maxsize: 1024000, // 1MB
      maxFiles: 5,
      format: format.combine(format.uncolorize())
    }),
    new transports.Console({
      handleExceptions: true
    })
  ],
  exceptionHandlers: [
    new transports.File({
      handleExceptions: true,
      filename: `${logDir}/exceptions.log`,
      maxsize: 1024000, // 1MB
      maxFiles: 5,
      format: format.combine(format.uncolorize())
    })
  ],
  exitOnError: true
})

logger.stream = {
  write: (message, encoding) => {
    if (message.indexOf('status: 5') >= 0) {
      logger.error(message.trim())
    } else if (message.indexOf('status: 4') >= 0) {
      logger.warn(message.trim())
    } else {
      logger.info(message.trim())
    }
  }
}

module.exports = logger
