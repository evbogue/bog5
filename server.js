import { bogbot } from './bogbot.js'

const pubkey = await bogbot.pubkey()

const content = 'Hello World'

const msg = await bogbot.publish(content)

const opened = await bogbot.open(msg)
console.log(opened)

const found = await bogbot.find(opened.msgHash)
console.log(found)
