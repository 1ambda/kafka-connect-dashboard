import webpack from 'webpack'
import webpackConfigBuilder from '../webpack.config'
import colors from 'colors'
import { argv as args, } from 'yargs'

import * as Logger from './BuildLogger'
import { OUTPUT_DIR, ENV_PROD, } from './BuildConfig'

const webpackConfig = webpackConfigBuilder(ENV_PROD)

const TAG = 'BuildBundle'

webpack(webpackConfig).run((err, stats) => {
  const inSilentMode = args.s

  if (err) {
    Logger.error(TAG, err)
    return 1
  }

  const jsonStats = stats.toJson()

  if (jsonStats.hasErrors) {
    return jsonStats.errors.map(error => Logger.error(TAG, error))
  }

  if (jsonStats.hasWarnings && !inSilentMode) {
    Logger.info(TAG, 'Webpack generated the following warnings: '.bold.yellow)
    jsonStats.warnings.map(warning => Logger.warn(warning))
  }

  Logger.info(TAG, `Build Done. \n${OUTPUT_DIR}\n`.green.bold)

  return 0
})
