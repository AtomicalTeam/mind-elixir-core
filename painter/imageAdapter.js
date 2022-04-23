// generateImage(`<img alt="Support for image.png" src="app://local/D:/Seregon/Computer/Docs/Second%20brain/Assets/A%20trier/Support%20for%20image.png?1650094332956" width="100">`, 389, 168)

export function generateImage(nodeObj, x, y) {
  var newNodeObj = nodeObj.replace('src', 'href')
  newNodeObj = newNodeObj.replace('img', 'image')
  var modified = newNodeObj.split(' ')
  // modified.push(`x="${x}" y="${y}"`)
  modified.splice(1, 0, `x="${x}" y="${y}"`)
  for (var element of modified) {
    if (element.includes('href')) {
      let src = element.split('href=')[1]
      src = src.substring('app://local/'.length + 1, src.lastIndexOf('?'))
      modified[modified.indexOf(element)] = 'href="' + src + '"'
    }
  }
  return modified.join(' ')
}
