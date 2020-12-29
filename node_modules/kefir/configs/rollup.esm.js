import base from './rollup.dev.js'

export default Object.assign({}, base, {
  format: 'es',
  dest: 'dist/kefir.esm.js',
})
