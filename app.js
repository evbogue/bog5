import { bogbot } from './bogbot.js'
import { h } from './lib/h.js'
import { cachekv } from './lib/cachekv.js'
import { composer } from './composer.js'
import { render } from './render.js'
import { profile } from './profile.js'

if (window.location.hash === '') {window.location.hash = '#'}

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
  const src = window.location.hash.substring(1)
  route(src)
}

route(window.location.hash.substring(1))

