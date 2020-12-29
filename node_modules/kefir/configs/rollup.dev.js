import babel from 'rollup-plugin-babel'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

const pkg = require('../package.json')

const banner = `/*! Kefir.js v${pkg.version}
 *  ${pkg.homepage}
 */
`

export default {
  moduleName: 'Kefir',
  entry: 'src/index.js',
  format: 'umd',
  banner: banner,
  plugins: [babel({presets: ['es2015-loose-rollup']}), nodeResolve({main: true}), commonjs()],
  dest: 'dist/kefir.js',
}
