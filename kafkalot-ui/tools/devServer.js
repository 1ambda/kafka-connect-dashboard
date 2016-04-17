import browserSync from 'browser-sync'

import historyApiFallback from 'connect-history-api-fallback'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import webpackConfigBuilder from '../webpack.config'

const webpackConfig = webpackConfigBuilder('development')
const bundler = webpack(webpackConfig)

browserSync.init({
  server: {
    baseDir: ['src', 'lib', ],

    middleware: [
      webpackDevMiddleware(bundler, {
        publicPath: webpackConfig.output.publicPath,
        stats: { colors: true, },
        noInfo: true,
      }),
      webpackHotMiddleware(bundler),
      historyApiFallback(),
    ],
  },

  files: [
    'src/*.html',
  ],
})
