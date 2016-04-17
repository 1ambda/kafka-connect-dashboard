import webpack from 'webpack'
import webpackConfigBuilder from '../webpack.config'
import colors from 'colors'
import { argv as args, } from 'yargs'

import { ENV_PROD, } from './env'

const webpackConfig = webpackConfigBuilder(ENV_PROD)

webpack(webpackConfig).run((err, stats) => {
  const inSilentMode = args.s

  if (!inSilentMode) {
    /* eslint-disable no-console */
    console.log('Generating minified bundle for production use via Webpack...'.bold.blue)
    /* eslint-enable no-console */
  }

  if (err) {
    console.log(err.bold.red) // eslint-disable-line no-console
    return 1
  }

  const jsonStats = stats.toJson()

  if (jsonStats.hasErrors) {
    /* eslint-disable no-console */
    return jsonStats.errors.map(error => console.log(error.red))
    /* eslint-enable no-console */
  }

  if (jsonStats.hasWarnings && !inSilentMode) {
    /* eslint-disable no-console */
    console.log('Webpack generated the following warnings: '.bold.yellow)
    jsonStats.warnings.map(warning => console.log(warning.yellow))
    /* eslint-enable no-console */
  }

  if (!inSilentMode) {
    console.log(`Webpack stats: ${stats}`) // eslint-disable-line no-console
  }

  /* eslint-disable no-console */
  console.log('Your app has been compiled in production mode and written to /dist. It\'s ready to roll!'.green.bold)
  /* eslint-enable no-console */

  return 0
})
