import { h } from './lib/h.js' 
import { bogbot } from './bogbot.js'
import { cachekv } from './lib/cachekv.js'
import { vb } from './lib/vb.js'
import { decode } from './lib/base64.js'

export const profile = async () => {
  const div = h('div', {id: 'controls'})

  const avatarImg = vb(decode(await bogbot.pubkey()), 256)

  avatarImg.style = 'height: 30px; width: 30px; float: left; margin-right: 5px;'

  avatarImg.onclick = () => {uploader.click()}

  const uploader = h('input', { type: 'file', style: 'display: none;'})

  uploader.addEventListener('change', (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()

    reader.onload = (e) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        const size = 64
        if (img.width > size || img.height > size) {
          const width = img.width
          const height = img.height
          let cropWidth
          let cropHeight

          if (width > height) {
            cropWidth = size
            cropHeight = cropWidth * (height / width)
          } else {
            cropHeight = size
            cropWidth = cropHeight * (width / height)
          }

          canvas.width = cropWidth
          canvas.height = cropHeight
          ctx.drawImage(img, 0, 0, width, height, 0, 0, cropWidth, cropHeight)
          const croppedImage = canvas.toDataURL()
          avatarImg.src = croppedImage
        } else {
          avatarImg.src = img.src
        }
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })


  div.appendChild(uploader)

  div.appendChild(avatarImg)

  div.appendChild(h('div', [await bogbot.pubkey()]))

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

  div.appendChild(namerDiv)
  return div
}
