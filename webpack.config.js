//@ts-check

'use strict'

const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')

/**@type {import('webpack').Configuration}*/
const config = {
  infrastructureLogging: {
    level: 'log',
  },
  target: 'node', // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
  node: false,

  entry: './extension.js', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]'
  },
  devtool: 'source-map',
  externals: {
    vscode: 'commonjs vscode' // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
  },
  plugins: [new CopyPlugin({
    patterns: [
      { from: './node_modules/shelljs/src/exec-child.js', to: '' },
      { from: './node_modules/trash/lib/windows-trash.exe', to: '' },
      { from: './node_modules/trash/lib/macos-trash', to: '' }
    ]
  })],
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  }
}
module.exports = config