import nacl from './lib/nacl-fast-es.js'
import { decode, encode } from './lib/base64.js'
import { cachekv } from './lib/cachekv.js'
import { human } from './lib/human.js'
import { vb } from './lib/vb.js'

export const bogbot = {}

bogbot.generate = async () => {
  const genkey = nacl.sign.keyPair()
  const keygen = encode(genkey.publicKey) + encode(genkey.secretKey)
  //await localStorage.setItem('keypair', keygen)
  return keygen
}

bogbot.keypair = async () => {
  const keypair = await localStorage.getItem('keypair')
  if (keypair) {
    return keypair
  }
}

bogbot.pubkey = async () => {
  const keypair = await bogbot.keypair()
  if (keypair) {
    return keypair.substring(0, 44)
  }
}

bogbot.privkey = async () => {
  const keypair = await bogbot.keypair()
  if (keypair) {
    return keypair.substring(44)
  }
}

bogbot.deletekey = async () => {
  localStorage.removeItem('keypair')
}

bogbot.hash = async (data) => {
  return encode(
    Array.from(
      new Uint8Array(
        await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data))
      )
    )
  )
}

bogbot.sign = async (data) => {
  const timestamp = Date.now()

  const hash = await bogbot.make(data)

  const sig = encode(nacl.sign(new TextEncoder().encode(timestamp + hash), decode(await bogbot.privkey())))
  await bogbot.add(await bogbot.pubkey() + sig)
  const protocolMsg = await bogbot.make(await bogbot.pubkey() + sig)
  localStorage.setItem('previous', protocolMsg)
  return protocolMsg
}

bogbot.open = async (msg) => {
  try {
    const pubkey = msg.substring(0, 44)
    const sig = msg.substring(44)

    const opened = new TextDecoder().decode(nacl.sign.open(decode(sig), decode(pubkey)))

    return opened
  } catch (err) {
    console.log('Not a valid Bog5 protocol message')
  }
}

import { yaml } from './lib/yaml.js'

bogbot.parseYaml = async (doc) => {
  return await yaml.parse(doc)
}

bogbot.createYaml = async (obj, content) => {
  return await yaml.create(obj, content)
}

bogbot.compose = async (content) => {
  const obj = {}

  const name = localStorage.getItem('name')
  const image = localStorage.getItem('image')
  const previous = localStorage.getItem('previous')

  if (name) { obj.name = name}
  if (image) { obj.image = image}
  if (previous) { obj.previous = previous}

  if (Object.keys(obj).length > 0) { 
    const yaml = await bogbot.createYaml(obj, content)
    return await bogbot.sign(yaml)
  } else {
    return await bogbot.sign(content)
  } 
}

bogbot.make = async (data) => {
  const hash = await bogbot.hash(data)

  await cachekv.put(hash, data)

  return hash
}

bogbot.find = async (hash) => {
  const blob = await cachekv.get(hash)

  return blob
}

let newMessages = false

setInterval(async () => {
  if (newMessages) {
    await cachekv.put('log', JSON.stringify(log))
    newMessages = false
  } 
}, 1000)

let log = []
const getLog = await cachekv.get('log')
if (getLog) {
  log = JSON.parse(getLog)
}

bogbot.add = async (msg) => {
  const opened = await bogbot.open(msg)
  if (opened) {
    const hash = await bogbot.make(msg)
    if (!log.includes(hash)) {
      log.push(hash)
      newMessages = true
      sort = true
    }
  }
}

bogbot.getLog = async () => {
  return log
}

bogbot.human = async (ts) => {
  return await human(new Date(parseInt(ts)))
}

bogbot.visual = async (pubkey) => {
  return vb(decode(pubkey), 256)
}

let sort = true

setInterval(async () => {
  if (sort) {
    const newArray = []
 
    await Promise.all(log.map(async (hash) => {
      const obj = {
        hash,
        sig: await bogbot.find(hash)
      }
      obj.opened = await bogbot.open(obj.sig)
      obj.ts = obj.opened.substring(0, 13)
      newArray.push(obj)
    }))
    
    await newArray.sort((a,b) => a.ts - b.ts) 

    const newLog = []

    await newArray.forEach(msg => {
      newLog.push(msg.hash)
    })

    log = newLog
    newMessages = true
    sort = false
  }
}, 20000)
