import { human } from './lib/human.js'
import { h } from './lib/h.js'
import { bogbot } from './bogbot.js'
import { vb } from './lib/vb.js'
import { decode } from './lib/base64.js'

export const render = async (m) => {

  const timestamp = h('a', {href: '#' + m.msgHash }, [human(new Date(m.timestamp))])

  const rawDiv = h('div')

  const raw = h('code', {
    style: 'cursor: pointer;',
    onclick: () => {
      if (!rawDiv.firstChild) {
        rawDiv.appendChild(h('pre', [JSON.stringify(m)]))
      } else {
        rawDiv.removeChild(rawDiv.firstChild)
      }
    }
  }, ['raw'])

  const right = h('span', {style: 'float: right;'}, [
    raw,
    ' ',
    timestamp
  ])

  const pubkey = h('a', {href: '#' + m.pubkey }, [m.pubkey.substring(0, 10)])

  const img = vb(decode(m.pubkey), 256)

  img.style = 'height: 30px; width: 30px; float: left; margin-right: 5px;'

  if (m.nameHash != m.pubkey) {
    pubkey.id = m.nameHash
    const name = await bogbot.find(m.nameHash)
    if (name) {
      pubkey.textContent = name
    } else {
      // gossip
    }
  }

  const dataDiv = h('div', {id: m.dataHash})

  const data = await bogbot.find(m.dataHash)

  if (data) { 
    dataDiv.textContent = data 
  } else {
    // gossip
  }

  const message = h('div', {
    id: m.msgHash, classList: 'message'
  }, [
    right,
    img,
    pubkey,
    dataDiv,
    rawDiv
  ])

  const messageDiv = h('div', [
    message
  ])

  return messageDiv
}

