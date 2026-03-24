const fs = require("fs")
const path = require("path")
const webpack = require("webpack")

const mode =
  process.env.NODE_ENV === "production" ? "production" : "development"
const isDev = mode === "development"

const RHINO3DM_ASSETS = ["rhino3dm.js", "rhino3dm.wasm"]


class CopyRhino3dmAssetsPlugin {
  apply(compiler) {
    const copyAssets = () => {
      const sourceDir = path.resolve(
        __dirname,
        "node_modules/three/examples/jsm/libs/rhino3dm"
      )
      const destinationDir = path.resolve(compiler.options.output.path, "rhino3dm")

      fs.mkdirSync(destinationDir, { recursive: true })
      RHINO3DM_ASSETS.forEach((filename) => {
        fs.copyFileSync(
          path.join(sourceDir, filename),
          path.join(destinationDir, filename)
        )
      })
    }

    compiler.hooks.beforeRun.tap("CopyRhino3dmAssetsPlugin", copyAssets)
    compiler.hooks.watchRun.tap("CopyRhino3dmAssetsPlugin", copyAssets)
  }
}


var config = {
  mode,
  entry: [__dirname + "/ts/index.tsx"],
  output: {
    path: __dirname + "/public/",
    filename: "bundle.js",
    publicPath: "/public/",
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.tsx?$/,
            exclude: [/node_modules/],
            loader: "esbuild-loader",
            options: {
              loader: "tsx",
              tsconfigRaw: require("./tsconfig.json"),
            },
          }
        ]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        }
      }
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  plugins: [
    new CopyRhino3dmAssetsPlugin(),
    new webpack.DefinePlugin({
      API_ENDPOINT: JSON.stringify(process.env.API_ENDPOINT),
      URL_PREFIX: JSON.stringify(process.env.URL_PREFIX || "/dashboard"),
    }),
  ],
}

if (isDev) {
  config.devtool = "source-map"
  config.cache = {
    type: "filesystem",
    buildDependencies: {
      config: [__filename],
    },
  }
  console.log("= = = = = = = = = = = = = = = = = = =")
  console.log("DEVELOPMENT BUILD")
  console.log("= = = = = = = = = = = = = = = = = = =")
} else {
  const CompressionPlugin = require("compression-webpack-plugin")
  config.plugins.push(new CompressionPlugin())
}

module.exports = config
