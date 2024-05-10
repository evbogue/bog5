import { bogbot } from './bogbot.js'
import { serveDir } from 'https://deno.land/std/http/file_server.ts'

const pubkey = await bogbot.pubkey()

console.log(pubkey)

const sockets = new Set()

const process = async (msg) => {
  console.log(msg)
}

Deno.serve((r) => {
  try {
    const { socket, response } = Deno.upgradeWebSocket(r)
    sockets.add(socket)
    socket.onmessage = process
    socket.onclose = _ => sockets.delete(socket)
    return response
  } catch {
    return serveDir(r, {quiet: 'True'})
  }
})

