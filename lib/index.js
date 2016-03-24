'use strict';

require('dotenv').config();

var fs = require('fs');
var path = require('path');
var glob = require('glob');
var webpack = require('webpack');
var AssetsPlugin = require('assets-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var AssetManifestPlugin = require('webpack-asset-manifest');
var WebpackMd5HashPlugin = require('webpack-md5-hash');

var cwd = process.cwd();

var nodeModulesDir = path.resolve(cwd, 'node_modules');
var jsDir = path.resolve(cwd, 'app/assets/javascripts');
var cssDir = path.resolve(cwd, 'app/assets/stylesheets');
var imageDir = path.resolve(cwd, 'app/assets/images');

var appEnv = process.env.APPLICATION_ENVIRONMENT || 'production';
var isDevelopment = appEnv === 'development';

var jsFilename = function jsFilename() {
  return isDevelopment ? '[name]-bundle.js' : '[name]-bundle-[chunkhash].js';
};

var cssFilename = function cssFilename() {
  return isDevelopment ? '[name]-bundle.css' : '[name]-bundle-[chunkhash].css';
};

var imageLoader = function imageLoader() {
  var result = {
    test: /.*\.(gif|png|jpe?g|svg|ico)$/i
  };
  if (isDevelopment) {
    result.loader = 'file?name=[name].[ext]';
  } else {
    result.loaders = ['file?hash=sha512&digest=hex&name=[name]-[hash].[ext]', 'image-webpack?{progressive:true, optimizationLevel: 7, interlaced: false, ' + 'pngquant:{quality: "65-90", speed: 4}}'];
  }
  return result;
};

var aliasConfig = function aliasConfig() {
  var aliasConfigFile = path.resolve(cwd, 'webpack-alias.config.js');
  return fs.existsSync(aliasConfigFile) ? require(aliasConfigFile) : {};
};

var config = {
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
    loaders: [{
      test: /\.jsx?$/,
      loader: 'babel-loader',
      exclude: [/node_modules/],
      cacheDirectory: true,
      presets: ['es2015']
    }, { test: /\.coffee$/, loader: 'coffee-loader?sourceMap' }, { include: /\.json$/, loaders: ['json-loader'] }, { test: /\.scss$/,
      loader: ExtractTextPlugin.extract('css?sourceMap!resolve-url!sass?sourceMap') }, { test: /\.css$/, loader: ExtractTextPlugin.extract('css?sourceMap!resolve-url') }, { test: /\.hbs$/, loader: 'handlebars-loader' }, imageLoader()]
  },
  resolve: {
    root: [jsDir, nodeModulesDir, cssDir, imageDir],
    alias: aliasConfig(),
    extensions: ['', '.js.coffee', '.coffee', '.webpack.js', '.web.js', '.js', '.jsx', '.hbs', '.scss', '.css', '.json']
  },
  resolveLoader: {
    root: nodeModulesDir
  },
  amd: { jQuery: true },
  plugins: [new WebpackMd5HashPlugin(), new webpack.optimize.OccurenceOrderPlugin(), new webpack.NoErrorsPlugin(), new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/), new ExtractTextPlugin(cssFilename(), { allChunks: true }), new AssetManifestPlugin('public/assets/webpack-assets.json', imageDir), new AssetsPlugin({
    path: path.join(cwd, 'public', 'assets'),
    filename: 'webpack-bundles.json'
  })]
};

if (!isDevelopment) {
  config.plugins.push(new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production')
    }
  }));
}

/** Add images to build **/
var images = glob.sync('app/assets/images/**/*.+(jpg|jpeg|gif|png|ico)');
images.forEach(function (image) {
  config.plugins.push(new webpack.PrefetchPlugin('./' + image));
});

module.exports = {
  appEnv: appEnv, config: config, isDevelopment: isDevelopment
};