import webpack from 'webpack'
import path from 'path'
import ExtractTextPlugin from 'extract-text-webpack-plugin'

import { ENV_DEV, ENV_PROD, ENV_TEST, } from './tools/env'
import { GLOBAL_VARIABLES, } from './tools/config'

const getPlugins = function (env) {
  const plugins = [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin(GLOBAL_VARIABLES),
  ]

  /* eslint-disable no-console */
  console.log('Injecting Global Variable'.green)
  console.log(GLOBAL_VARIABLES)
  /* eslint-enable no-console */

  switch (env) {
    case ENV_PROD:
      plugins.push(new ExtractTextPlugin('styles.css'))
      plugins.push(new webpack.optimize.DedupePlugin())
      plugins.push(new webpack.optimize.UglifyJsPlugin())
      break

    case ENV_DEV:
      plugins.push(new webpack.HotModuleReplacementPlugin())
      plugins.push(new webpack.NoErrorsPlugin())
      break
  }

  return plugins
}

const getEntry = function (env) {
  const entry = []

  if (env === ENV_DEV) entry.push('webpack-hot-middleware/client')

  entry.push('./src/index')

  return entry
}

const getPostcssPlugins = function (env) {

  let browsers = ['last 10 version', '> 5%', 'ie >= 8',]

  let plugins = [
    require('postcss-url')({
      copy: 'rebase',
    }),
    require('postcss-cssnext')({
      browsers: browsers,
    }),
    require('postcss-reporter')({
      clearMessages: true,
    }),
    require('autoprefixer')({
      browsers: browsers,
    }),
    require('postcss-import')(),
  ]

  return plugins
}


const getLoaders = function (env) {
  const loaders = [
    {
      test: /\.js$/,
      include: path.join(__dirname, 'src'),
      loaders: ['babel', 'eslint',],
    },
    { /** globally used css */
      test: /(\.css)$/,
      include: [ path.join(__dirname, 'node_modules'), ],
      loaders: ['style', 'css?sourceMap&importLoaders=1', 'postcss',],
    },
    {
      test: /\.woff(\?\S*)?$/,
      loader: 'url-loader?limit=10000&minetype=application/font-woff',
    },
    {
      test: /\.woff2(\?\S*)?$/,
      loader: 'url-loader?limit=10000&minetype=application/font-woff',
    },
    {
      test: /\.eot(\?\S*)?$/,
      loader: 'url-loader',
    }, {
      test: /\.ttf(\?\S*)?$/,
      loader: 'url-loader',
    },
    {
      test: /\.svg(\?\S*)?$/,
      loader: 'url-loader',
    },
  ]

  if (env === ENV_PROD) {
    loaders.push({
        test: /(\.css)$/,
        include: path.join(__dirname, 'src'),
        loader: ExtractTextPlugin.extract(['style', 'css?sourceMap&module&importLoaders=1', 'postcss',]),
      }
    )
  } else {
    loaders.push({
        test: /(\.css)$/,
        include: path.join(__dirname, 'src'),
        loaders: ['style', 'css?sourceMap&module&importLoaders=1', 'postcss',],
      }
    )
  }

  return loaders
}

function getConfig(env) {
  return {
    debug: true,
    devtool: env === ENV_PROD? 'source-map' : 'cheap-module-eval-source-map', // more info:https://webpack.github.io/docs/build-performance.html#sourcemaps and https://webpack.github.io/docs/configuration.html#devtool
    entry: getEntry(env),
    target: env === ENV_TEST? 'node' : 'web',
    output: {
      path: __dirname + '/dist',
      publicPath: '',
      filename: 'bundle.js',
    },
    externals: {
      //required: 'variable',
    },
    plugins: getPlugins(env),
    module: { loaders: getLoaders(env), },
    postcss: getPostcssPlugins(),

    /** logging */

    /** suppress error shown in console, so it has to be set to false */
    quiet: false,
    noInfo: true,
    stats: {
      /** Config for minimal console.log mess. */
      assets: false,
      colors: true,
      version: false,
      hash: false,
      timings: false,
      chunks: false,
      chunkModules: false
    }
  }
}

export default getConfig
