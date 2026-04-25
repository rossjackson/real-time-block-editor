import Dotenv from 'dotenv-webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Configuration } from 'webpack'
import type { Configuration as DevServerConfiguration } from 'webpack-dev-server'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const appRoot = process.cwd()
const distRoot = path.resolve(appRoot, '../../dist/apps/frontend')

const config: Configuration & { devServer?: DevServerConfiguration } = {
  entry: './src/main.tsx',
  output: {
    filename: 'bundle.js',
    path: distRoot,
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    new Dotenv({
      path: path.resolve(__dirname, '.env'),
    }),
  ],
  devServer: {
    port: 3000,
    open: true,
    hot: true,
    static: {
      directory: distRoot,
    },
  },
}

export default config
