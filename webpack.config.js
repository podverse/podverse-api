/* eslint-disable @typescript-eslint/camelcase */

const webpack = require('webpack')
const path = require('path')
const outPath = path.join(__dirname, './dist')
const sourcePath = path.join(__dirname, './src')
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
  context: sourcePath,
  entry: './server',
  target: 'node',
  mode: 'none',
  output: {
    path: outPath,
    filename: 'bundle.js',
    chunkFilename: '[chunkhash].js'
  },
  resolve: {
    extensions: ['*', '.ts', '.js', '.json'],
    modules: [
      path.resolve(__dirname, 'src'),
      'node_modules'
    ],
    alias: {
      '~': path.resolve(__dirname, 'src/')
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      }      
    ]
  },
  optimization: {
    nodeEnv: false
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new webpack.IgnorePlugin(/^pg-native$|^hiredis$|^pg-hstore$|^tedious$|^spdx-expression-parse$|^spdx-correct$/),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
  ],
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  }
}
