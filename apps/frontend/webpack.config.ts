import path from "node:path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import type { Configuration } from "webpack";
import type { Configuration as DevServerConfiguration } from "webpack-dev-server";

const appRoot = process.cwd();
const distRoot = path.resolve(appRoot, "../../dist/apps/frontend");

const config: Configuration & { devServer?: DevServerConfiguration } = {
  entry: "./src/main.tsx",
  output: {
    filename: "bundle.js",
    path: distRoot,
    clean: true
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html"
    })
  ],
  devServer: {
    port: 3000,
    open: true,
    hot: true,
    static: {
      directory: distRoot
    }
  }
};

export default config;
