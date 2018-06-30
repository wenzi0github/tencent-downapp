import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

const config = require( './package' );

const banner =
  '/*!\n' +
  ' * AppDownload v' + config.version + '\n' +
  ' * last update: ' + (new Date()).toLocaleDateString() + ', author: skeetershi\n' +
  ' * Released under the MIT License.\n' +
  ' */'

export default {
  entry: './src/index.js',
  plugins: [
    resolve(),
    babel({
      exclude: './node_modules/**',
      plugins: ['external-helpers']
    })
  ],
  output: {
    file: './dist/bundle.js',
    format: 'umd'
  },
  banner
};