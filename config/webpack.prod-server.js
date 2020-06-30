const path = require("path")
const webpack = require("webpack")
const externals = require("./node-externals");
const ExtractCssChunks = require("extract-css-chunks-webpack-plugin")

module.exports = {
  name: "server",
  target: "node",
  mode: "production",
  externals,
  entry: "./server/render.tsx",
  output: {
    filename: "prod-server-bundle.js",
    path: path.resolve(__dirname, "../build"),
    libraryTarget: "commonjs2",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader"
          }
        ]
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader"
          }
        ]
      },
      {
        test: /\.css$/,
        use: [ExtractCssChunks.loader, "css-loader"]
      }, {
        test: /\.(jpg|png|gif)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "images/[name].[ext]",
              emitFile: false
            }
          }
        ]
      },
      {
        test: /\.md$/,
        use: [
          {
            loader: "markdown-with-front-matter-loader"
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".css"]
  },
  plugins: [new ExtractCssChunks(),
  new webpack.optimize.LimitChunkCountPlugin({
    maxChunks: 1
  }),
  new webpack.DefinePlugin({
    "process.env": {
      NODE_ENV: JSON.stringify("production")
    }
  })
  ]
}
