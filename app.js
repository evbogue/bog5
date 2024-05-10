import { bogbot } from './bogbot.js'
import { h } from './lib/h.js'
import { cachekv } from './lib/cachekv.js'
import { render } from './render.js'

const screen = h('div', {id: 'screen'})

const scroller = h('div', {id: 'scroller'})

const controls = h('div', {id: 'controls'})

document.body.appendChild(screen)
screen.appendChild(scroller)
scroller.appendChild(controls)

controls.appendChild(h('div', [await bogbot.pubkey()]))

const nameHash = await cachekv.get('name')
const nameBlob = await bogbot.find(nameHash)

const namer = h('input', {
  placeholder: nameBlob ||'Name yourself' 
})

const namerDiv = h('div', [
  namer,
  h('button', {onclick: async () => {
    if (namer.value) {
      namer.placeholder = namer.value
      const nameBlob = await bogbot.make(namer.value)
      await cachekv.put('name', nameBlob)
      namer.value = ''
    }
  }}, ['Save'])
])

controls.appendChild(namerDiv)

const composer = h('textarea', {placeholder: 'Write something ...'})

const composeDiv = h('div', [
  composer,
  h('button', {onclick: async () => {
    if (composer.value) {
      const published = await bogbot.publish(composer.value)
      composer.value = ''
      const opened = await bogbot.open(published)
      const rendered = await render(opened)
      scroller.firstChild.after(rendered)      
    } 
  }}, ['Send'])
])

controls.appendChild(composeDiv)
