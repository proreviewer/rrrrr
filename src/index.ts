import * as dotenv from 'dotenv'
dotenv.config()

import { exitHandler } from './handler'
import client from './client'
import logger from './logger'

logger.info('Started...')

client.login(process.env.TOKEN)
  .catch(e => exitHandler(1, e))

/**
 * 프로세스 이벤트
 */
process.on('uncaughtException', e => exitHandler(1, e))
process.on('unhandledRejection', e => exitHandler(1, e))
process.on('SIGINT', () => exitHandler(2))
process.on('SIGUSR1', () => exitHandler(16))
process.on('SIGUSR2', () => exitHandler(17))
