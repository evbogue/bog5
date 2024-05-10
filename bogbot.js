import nacl from './lib/nacl-fast-es.js'
import { decode, encode } from './lib/base64.js'
import { cachekv } from './lib/cachekv.js'

export const bogbot = {}

const generate = async () => {
  const genkey = nacl.sign.keyPair()
  return encode(genkey.publicKey) + encode(genkey.secretKey)
}

bogbot.keypair = async () => {
  let keypair = await localStorage.getItem('keypair')
  if (!keypair) {
    keypair = await generate()
    await localStorage.setItem('keypair', keypair)
  }
  return keypair
}

bogbot.pubkey = async () => {
  const keypair = await bogbot.keypair()
  return keypair.substring(0, 44)
}

bogbot.privkey = async () => {
  const keypair = await bogbot.keypair()
  return keypair.substring(44)
}

bogbot.deletekey = async () => {
  localStorage.removeItem('keypair')
}

const sha256 = async (data) => {
  const hash = encode(
    Array.from(
      new Uint8Array(
        await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data))
      )
    )
  )
  return hash
}

bogbot.publish = async (data) => {
  const pubkey = await bogbot.pubkey()
  const privkey = await bogbot.privkey()

  const nameHash = await cachekv.get('name') || pubkey
  const imageHash = await cachekv.get('image') || pubkey 
  const previous = await cachekv.get('previous') || pubkey

  const dataHash = await sha256(data)
  await cachekv.put(dataHash, data)

  const content = nameHash + imageHash + dataHash + previous
  const contentHash = await sha256(content)
  await cachekv.put(contentHash, content)

  const msg = Date.now() + contentHash

  const msgHash = await sha256(msg)
  await cachekv.put(msgHash, msg)

  const signed = encode(
    nacl.sign(decode(msgHash), 
    decode(privkey))
  )

  const protocol = pubkey + signed

  return protocol
}

bogbot.open = async (protocol) => {
  const pubkey = protocol.substring(0, 44)
  const signed = protocol.substring(44)

  const opened = encode(nacl.sign.open(decode(signed), decode(pubkey)))
  const obj = {pubkey, msgHash: opened}
  const msg = await bogbot.find(obj.msgHash)

  obj.timestamp = parseInt(msg.substring(0, 13))
  const contentHash = msg.substring(13)

  const content = await bogbot.find(contentHash)
  obj.nameHash = content.substring(0, 44)
  obj.imageHash = content.substring(44, 88)
  obj.dataHash = content.substring(88, 132)
  obj.prevHash = content.substring(132)

  return obj
}

const log = await cachekv.get('log') || []

bogbot.find = async (hash) => {
  const found = await cachekv.get(hash)
  return found
}

bogbot.make = async (data) => {
  const hash = await sha256(data)
  await cachekv.put(hash, data)
  return hash
}
