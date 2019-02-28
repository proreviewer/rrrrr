import * as PrettyError from 'pretty-error'
import client from './client'
import logger from './logger'
import PluginManager from './pluginManager'

const pe = new PrettyError()

pe.appendStyle({
  'pretty-error': {
    margin: 0
  },
  'pretty-error > header > title > kind': {
    display: 'none'
  },
  'pretty-error > header > colon': {
    display: 'none'
  },
  'pretty-error > header > message': {
    background: 'red',
    color: 'bright-white'
  },
  'pretty-error > trace': {
    marginTop: 0,
    marginLeft: 2
  },
  'pretty-error > trace > item': {
    marginBottom: 0
  }
})

/**
 * 오류 스택을 정리해 출력합니다.
 * @param e
 */
function errorHandler (e: Error): string {
  return pe.render(e)
}

/**
 * 실행 중인 프로그램을 안전하게 종료합니다.
 * @param code
 * @param e
 */
async function exitHandler (code: number, e?: Error) {
  logger.info(`exitHandler(${code})`)

  if (e instanceof Error) {
    logger.error(errorHandler(e))
  }

  try {
    await PluginManager.unloadAll()

    if (client.destroy) {
      await client.destroy()
    }
  } catch (err) {
    logger.error(errorHandler(err))
  }

  process.exit(code)
}

export {
  errorHandler,
  exitHandler
}
