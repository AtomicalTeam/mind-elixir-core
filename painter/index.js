import Canvg from 'canvg'
import { generateImage } from './imageAdapter'

const head = `<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">`
const IMG_PADDING = 40
let $d = document
let maxTop, maxBottom, maxLeft, maxRight, svgHeight, svgWidth

function initVar() {
  maxTop = 10000
  maxBottom = 10000
  maxLeft = 10000
  maxRight = 10000
  svgHeight = 0
  svgWidth = 0
}

function generateSvgDom() {
  const primaryNodes = $d.querySelectorAll('.box > grp, root')
  let svgContent = ''
  // calculate distance to center from top, left, bottom, right
  for (let i = 0; i < primaryNodes.length; i++) {
    const primaryNode = primaryNodes[i]
    const rect = primaryNode.getBoundingClientRect()
    const top = primaryNode.offsetTop
    const bottom = top + rect.height
    const left = primaryNode.offsetLeft
    const right = left + rect.width

    if (top < maxTop) {
      maxTop = top
    }
    if (bottom > maxBottom) {
      maxBottom = bottom
    }
    if (left < maxLeft) {
      maxLeft = left
    }
    if (right > maxRight) {
      maxRight = right
    }
  }

  for (let i = 0; i < primaryNodes.length; i++) {
    const primaryNode = primaryNodes[i]
    if (primaryNode.tagName === 'ROOT') continue
    svgContent += PrimaryToSvg(primaryNode)
  }
  console.log(maxTop, maxBottom, maxLeft, maxRight)
  svgContent += RootToSvg()
  // image margin
  svgHeight = maxBottom - maxTop + IMG_PADDING * 2 * 2
  svgWidth = maxRight - maxLeft + IMG_PADDING * 2 * 2
  // svgContent += customLinkTransform()
  const svgFile = createSvg(svgHeight, svgWidth)
  svgContent =
    `<rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" fill="#f6f6f6"></rect>` +
    svgContent
  svgFile.innerHTML = svgContent
  // document.body.append(svgFile)
  return svgFile
}

function createSvg(height, width) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('height', height)
  svg.setAttribute('width', width)
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  svg.setAttribute('version', '1.2')
  svg.setAttribute('xlink', 'http://www.w3.org/1999/xlink')
  return svg
}

function RootToSvg() {
  const root = $d.querySelector('root')
  const rootTpc = $d.querySelector('root > tpc')
  const rect = rootTpc.getBoundingClientRect()
  const top = 0
  const left = 0
  const nodeObj = $d.querySelector('root > tpc').nodeObj
  const rootOffsetY = root.offsetTop - maxTop
  const rootOffsetX = root.offsetLeft - maxLeft

  const svg2ndEle = $d.querySelector('.svg2nd')

  const svg2nd = `<g transform="translate(${IMG_PADDING - maxLeft}, ${IMG_PADDING - maxTop
  })">${svg2ndEle.innerHTML}</g>`
  console.log('Hello')
  return (
    svg2nd +
    `<g id="root" transform="translate(${rootOffsetX + IMG_PADDING}, ${rootOffsetY + IMG_PADDING
    })">
      <rect x="${left}" y="${top}" rx="5px" ry="5px" width="${rect.width
    }" height="${rect.height}" style="fill: #00aaff;"></rect>
      <text x="${left + 15}" y="${top + 35
    }" text-anchor="start" align="top" anchor="start" font-family="微软雅黑" font-size="25px" font-weight="normal" fill="#ffffff">
        ${nodeObj.topic}
      </text>
  </g>`
  )
}

function PrimaryToSvg(primaryNode) {
  const topics = primaryNode.querySelectorAll('tpc')
  const primaryNodeOffsetY = primaryNode.offsetTop - maxTop
  const primaryNodeOffsetX = primaryNode.offsetLeft - maxLeft

  let svg = ''
  const svg3rd = primaryNode.querySelector('.svg3rd')
  svg += `<g transform="translate(${primaryNodeOffsetX + IMG_PADDING}, ${primaryNodeOffsetY + IMG_PADDING
  })">`
  svg += svg3rd ? svg3rd.innerHTML : ''
  for (let i = 0; i < topics.length; i++) {
    const tpc = topics[i]
    const t = tpc.parentNode
    const nodeObj = tpc.nodeObj
    if (nodeObj.root) {
      continue
    }
    const tpcRect = tpc.getBoundingClientRect()
    const top = t.offsetTop
    const left = t.offsetLeft
    const tpcStyle = getComputedStyle(tpc)
    const tStyle = getComputedStyle(t)
    const topicOffsetLeft =
      left + parseInt(tStyle.paddingLeft) + parseInt(tpcStyle.paddingLeft)
    const topicOffsetTop =
      top +
      parseInt(tStyle.paddingTop) +
      parseInt(tpcStyle.paddingTop) +
      parseInt(tpcStyle.fontSize)
    // style render
    let border = ''
    if (tpcStyle.borderWidth !== '0px') {
      border = `<rect x="${left + 15}" y="${top}" rx="5px" ry="5px" width="${tpcRect.width
      }" height="${tpcRect.height
      }" style="fill: rgba(0,0,0,0); stroke:#444;stroke-width:1px;"></rect>`
    }
    let backgroundColor = ''
    if (tpcStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      backgroundColor = `<rect x="${left + 15
      }" y="${top}" rx="5px" ry="5px" width="${tpcRect.width}" height="${tpcRect.height
      }" style="fill: ${tpcStyle.backgroundColor};"></rect>`
    }
    // render tags
    let tags = ''
    if (nodeObj.tags && nodeObj.tags.length) {
      const tagsEle = tpc.querySelectorAll('.tags > span')
      for (let i = 0; i < tagsEle.length; i++) {
        const tag = tagsEle[i]
        const tagRect = tag.getBoundingClientRect()

        tags += `<rect x="${topicOffsetLeft}" y="${topicOffsetTop + 4
        }" rx="5px" ry="5px" width="${tagRect.width}" height="${tagRect.height
        }" style="fill: #d6f0f8;"></rect>
        <text font-family="微软雅黑" font-size="12px"  fill="#276f86" x="${topicOffsetLeft + 4
}" y="${topicOffsetTop + 4 + 12}">${tag.innerHTML}</text>`
      }
    }
    let icons = ''
    if (nodeObj.icons && nodeObj.icons.length) {
      const iconsEle = tpc.querySelectorAll('.icons > span')
      for (let i = 0; i < iconsEle.length; i++) {
        const icon = iconsEle[i]
        // const iconRect = icon.getBoundingClientRect()
        icons += `
        <tspan>${icon.innerHTML}</tspan>`
      }
    }
    if (nodeObj.topic.includes('<img')) {
      svg += `<g id="${nodeObj.id}">
      ${border}
      ${backgroundColor}
      ${generateImage(nodeObj.topic, topicOffsetLeft, topicOffsetTop)}
      ${icons}
      ${tags}
      </g>`
      // \<-- ${nodeObj.id} ${border} ${backgroundColor} ${nodeObj.topic} ${icons} ${tags}} --\>
    } else {
      svg += `<g id="${nodeObj.id}">
      ${border}
      ${backgroundColor}
      <text x="${topicOffsetLeft}" y="${topicOffsetTop}" text-anchor="start" align="top" anchor="start" font-family="微软雅黑" font-size="${tpcStyle.fontSize}" font-weight="${tpcStyle.fontWeight}" fill="${tpcStyle.color}">
        ${nodeObj.topic}
        ${icons}
      </text>
      ${tags}
  </g>`
    }
  }
  svg += '</g>'
  return svg
}
/*
function splitMultipleLineText() {
  const maxWidth = 800 // should minus padding
  const text = ''
  const textEl = document.createElement('span')
  textEl.style.cssText =
    'padding:0;margin:0;font-family:微软雅黑;font-size:18px;font-weight:bolder;'
  textEl.innerHTML = ''
  const lines = []
  for (let i = 0; i < text.length; i++) {
    textEl.innerHTML += text[i]
    const w = textEl.getBoundingClientRect().width
    if (w > maxWidth) {
      lines.push(textEl.innerHTML)
      textEl.innerHTML = ''
    }
  }
  return lines
}
*/
function getFileName() {
  return $d.querySelector('root > tpc').innerText
}
/*
function customLinkTransform() {
  const customLinks = $d.querySelector('.topiclinks').children
  let resLinks = ''
  for (let i = 0; i < customLinks.length; i++) {
    const customLink = customLinks[i].outerHTML
    let cnt = 0
    const data = customLink.replace(/\d+(\.\d+)? /g, function(match) {
      match = Number(match)
      console.log(match, svgWidth, svgHeight)
      let res
      if (match < 256) {
        res = match
      } else {
        if (cnt % 2) {
          // y
          res = match - 10000 + svgHeight / 2
        } else {
          // x
          res = match - 10000 + svgWidth / 2
        }
      }
      cnt++
      return res + ' '
    })
    resLinks += data
  }
  console.log(resLinks)
  return resLinks
}
*/
export const exportSvg = function(instance, fileName) {
  if (!instance) throw new Error('Mind-elixir instance is not presented. ---> exportSvg(instance, fileName)')
  initVar()
  $d = instance.container
  const svgFile = generateSvgDom()
  const dlUrl = URL.createObjectURL(
    new Blob([head + svgFile.outerHTML.replace(/&nbsp;/g, ' ')])
  )
  const a = document.createElement('a')
  a.href = dlUrl
  a.download = (fileName || getFileName()) + '.svg'
  a.click()
}

export const exportPng = async function(instance, fileName) {
  if (!instance) throw new Error('Mind-elixir instance is not presented. ---> exportSvg(instance, fileName)')
  initVar()
  $d = instance.container
  const svgFile = generateSvgDom()
  const canvas = document.createElement('canvas')
  canvas.style.display = 'none'
  const ctx = canvas.getContext('2d')

  const v = await Canvg.fromString(
    ctx,
    head + svgFile.outerHTML.replace(/&nbsp;/g, ' ')
  )
  v.start()
  const imgURL = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = imgURL
  a.download = fileName || getFileName() + '.png'
  a.click()
}

export default {
  exportSvg,
  exportPng,
}
