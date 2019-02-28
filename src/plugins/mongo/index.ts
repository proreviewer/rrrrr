import { MongoClient } from 'mongodb'

let client: MongoClient

export async function onLoad () {
  client = await MongoClient.connect(process.env.DB_URL, {
    useNewUrlParser: true
  })
}

export function getClient () {
  return client
}

export function getDatabase (name?: string) {
  return client.db(name || process.env.DB_NAME)
}
