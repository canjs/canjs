const fs = require('fs')
const pug = require('pug')
const pkg = require('../package.json')

function escapehtml(block) {
  return block
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

const compiled = pug.compileFile('./docs-src/index.pug', {filters: {escapehtml}})
fs.writeFileSync('./index.html', compiled({pkg}))
console.log('Documentation rendered!')
