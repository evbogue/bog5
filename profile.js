import { h } from './lib/h.js' 
import { bogbot } from './bogbot.js'

export const profile = async () => {
  const div = h('div')

  const avatarImg = await bogbot.visual(await bogbot.pubkey())

  const existingImage = await bogbot.get('image')
  
  if (existingImage) { avatarImg.src = await bogbot.get(existingImage)}

  avatarImg.style = 'height: 30px; width: 30px; float: left; margin-right: 5px; object-fit: cover;'

  avatarImg.onclick = () => {uploader.click()}

  const uploader = h('input', { type: 'file', style: 'display: none;'})

  uploader.addEventListener('change', (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()

    reader.onload = (e) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = async () => {
        const size = 256
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
          const hash = await bogbot.make(croppedImage)
          await bogbot.put('image', hash)
        } else {
          const croppedImage = canvas.toDataURL()
          avatarImg.src = img.src
          const hash = await bogbot.make(img.src)
          await bogbot.put('image', hash)
        }
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })


  div.appendChild(uploader)

  div.appendChild(avatarImg)

  div.appendChild(h('div', [await bogbot.pubkey()]))

  const name = await bogbot.get('name')
  
  const namer = h('input', {
    placeholder: name || 'Name yourself'
  })


  const namerDiv = h('div', [
    namer,
    h('button', {onclick: async () => {
      if (namer.value) {
        namer.placeholder = namer.value
        await bogbot.put('name', namer.value)
        namer.value = ''
      }
    }}, ['Save'])
  ])

  div.appendChild(namerDiv)
  return div
}
