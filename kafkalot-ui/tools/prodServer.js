import browserSync from 'browser-sync'
import historyApiFallback from 'connect-history-api-fallback'

import { OUTPUT_DIR, } from './buildConfig'

browserSync.init({
  port: 3000,
  ui: { port: 3001, },
  server: {
    baseDir: [ OUTPUT_DIR, ],
  },

  files: [ 'src/*.html', ],

  middleware: [
    historyApiFallback(),
  ],
})
