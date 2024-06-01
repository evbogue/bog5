import { bogbot } from './bogbot.js'
import { h } from './lib/h.js'
import { cachekv } from './lib/cachekv.js'
import { composer } from './composer.js'
import { render } from './render.js'
import { profile } from './profile.js'
import { connect } from './connect.js'

if (window.location.hash === '') {window.location.hash = '#'}

connect()

const route = async (src) => {
  const screen = h('div', {id: 'screen'})
  const scroller = h('div', {id: 'scroller'})
  const controls = h('div', {id: 'controls'})
  
  document.body.appendChild(screen)
  screen.appendChild(scroller)
  scroller.appendChild(controls)

  if (src === '' || src === await bogbot.pubkey()) {
    controls.appendChild(await profile())
    controls.appendChild(await composer())
  }  

  for (const opened of await bogbot.query(src)) {
    const rendered = await render(opened)
    controls.after(rendered)
  }
}

window.onhashchange = async () => {
  const screen = document.getElementById('screen')
  screen.parentNode.removeChild(screen)  
  route(window.location.hash.substring(1))
}

route(window.location.hash.substring(1))

