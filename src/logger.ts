import { createLogger, format, transports } from 'winston'

/**
 * TODO: File logger
 */

const logger = createLogger({
  level: process.env.LOG_LEVEL,
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(i => `[${i.timestamp}][${i.level}] ${i.message}`)
      )
    })
  ]
})

export default logger
