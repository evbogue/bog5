import { h } from './lib/h.js'
import { bogbot } from './bogbot.js'
import { render } from './render.js'

export const composer = async (m) => {
  const compose = h('textarea', {placeholder: 'Write something ...'})
  const composeDiv = h('div', [
    compose,
    h('button', {onclick: async () => {
      if (compose.value) {
        const scroller = document.getElementById('scroller')
        const published = await bogbot.publish(compose.value)
        compose.value = ''
        const opened = await bogbot.open(published)
        const rendered = await render(opened)
        scroller.firstChild.after(rendered)
      }
    }}, ['Send'])
  ])

  return composeDiv
} 

