require('dotenv').config({ silent: true })

const fs = require('fs')
const path = require('path')
const glob = require('glob')
const webpack = require('webpack')
const AssetsPlugin = require('assets-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const AssetManifestPlugin = require('webpack-asset-manifest')
const WebpackMd5HashPlugin = require('webpack-md5-hash')
const Autoprefixer = require('autoprefixer')

const cwd = process.cwd()

const nodeModulesDir = path.resolve(cwd, 'node_modules')
const jsDir = path.resolve(cwd, 'app/assets/javascripts')
const cssDir = path.resolve(cwd, 'app/assets/stylesheets')
const imageDir = path.resolve(cwd, 'app/assets/images')

const appEnv = process.env.APPLICATION_ENVIRONMENT || 'production'
const isDevelopment = appEnv === 'development'

const jsFilename = function() {
  return isDevelopment ? '[name]-bundle.js' : '[name]-bundle-[chunkhash].js'
}

const cssFilename = function() {
  return isDevelopment ? '[name]-bundle.css' : '[name]-bundle-[contenthash:20].css'
}

const imageLoader = function() {
  const result = {
    test: /.*\.(gif|png|jpe?g|ico)$/i
  }
  if (isDevelopment) {
    result.loader = 'file?name=[name].[ext]'
  } else {
    result.loaders = [
      'file?hash=sha512&digest=hex&name=[name]-[hash].[ext]'
    ]
  }
  return result
}

const aliasConfig = function() {
  const aliasConfigFile = path.resolve(cwd, 'webpack-alias.config.js')
  return fs.existsSync(aliasConfigFile) ? require(aliasConfigFile) : {}
}

const config = {
  context: cwd,
  entry: {
    main: './app/assets/javascripts/main'
  },
  output: {
    path: path.join(cwd, 'public', 'assets'),
    filename: jsFilename(),
    publicPath: '/assets/'
  },
  externals: {
    pinball: 'pinball'
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: [/node_modules/],
        cacheDirectory: true,
        query: {
          presets: ['es2015', 'react']
        }
      },
      { test: /\.coffee$/, loader: 'coffee-loader?sourceMap' },
      { include: /\.json$/, loaders: ['json-loader'] },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract('css?sourceMap!postcss!resolve-url!sass?sourceMap')
      },
      { test: /\.css$/, loader: ExtractTextPlugin.extract('css?sourceMap!postcss!resolve-url') },
      { test: /\.hbs$/, loader: 'handlebars-loader' },
      { test: /\.svg$/, loader: 'file?hash=sha512&digest=hex&name=[name]-[hash].svg' },
      imageLoader()
    ]
  },
  resolve: {
    root: [jsDir, nodeModulesDir, cssDir, imageDir],
    alias: aliasConfig(),
    extensions: ['', '.js.coffee', '.coffee', '.webpack.js', '.web.js', '.js', '.jsx',
                 '.hbs', '.scss', '.css', '.json']
  },
  resolveLoader: {
    root: nodeModulesDir
  },
  amd: { jQuery: true },
  plugins: [
    new WebpackMd5HashPlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
    new ExtractTextPlugin(cssFilename(), { allChunks: true }),
    new AssetManifestPlugin('public/assets/webpack-assets.json', imageDir),
    new AssetsPlugin({
      path: path.join(cwd, 'public', 'assets'),
      filename: 'webpack-bundles.json'
    })
  ],

  postcss: [ Autoprefixer ]
}

if (!isDevelopment) {
  config.plugins.push(new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production')
    }
  }))
}

/** Add images to build **/
const images = glob.sync('app/assets/images/**/*.+(jpg|jpeg|gif|png|ico)')
images.forEach(image => {
  config.plugins.push(new webpack.PrefetchPlugin(`./${image}`))
})

module.exports = {
  appEnv, config, isDevelopment
}
