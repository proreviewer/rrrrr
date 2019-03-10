import { Snowflake } from 'discord.js'
import { getDatabase } from '../mongo'
import logger from '../../logger'

interface Query {
  id: Snowflake,
  key: string,
  value?: any
}

let queryQueue: Query[] = []
let queryInterval

export async function onLoad () {
  queryInterval = setInterval(flush, 30000)
}

export async function onUnload () {
  await flush()
  clearInterval(queryInterval)
}

/**
 * 대기 중인 쿼리를 모두 실행합니다.
 */
export async function flush () {
  if (queryQueue.length > 0) {
    const collection = getDatabase().collection('metadata')
    const queries = queryQueue.map(q => {
      const filter = { id: q.id, key: q.key }

      // 값이 null 이라면 제거하기
      if (q.value === null) {
        return {
          deleteOne: { filter }
        }
      }

      // 업데이트 쿼리 추가하기
      return {
        updateOne: {
          filter,
          update: { $set: { value: q.value } },
          upsert: true
        }
      }
    })

    // 쿼리 실행
    await collection.bulkWrite(queries)
    logger.debug(`메타데이터 쿼리 ${queryQueue.length}개를 실행했습니다.`)
    queryQueue = []
  }

  return true
}

/**
 * 메타데이터를 가져옵니다.
 * @param id 아이디
 * @param key 키
 */
export async function getMetadata (id: Snowflake, key: string) {
  // 큐에 존재할 경우
  for (let i = 0, len = queryQueue.length; i < len; i++) {
    const queue = queryQueue[i]
    if (queue.id === id && queue.key === key) {
      return queue.value
    }
  }

  const collection = getDatabase().collection('metadata')
  const data = await collection.findOne({ id, key })

  return data ? data.value : null
}

/**
 * 메타데이터를 설정합니다.
 * @param id 아이디
 * @param key 키
 * @param value 값
 */
export function setMetadata (id: Snowflake, key: string, value: any) {
  queryQueue.push({ id, key, value })
  return true
}

/**
 * 메타데이터를 제거합니다.
 * @param id 아이디
 * @param key 키
 */
export function unsetMetadata (id: Snowflake, key: string) {
  return setMetadata(id, key, null)
}
