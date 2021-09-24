process.env.UNI_USING_VUE3 = true
process.env.UNI_USING_VUE3_OPTIONS_API = true
const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')
module.exports = {
  configureWebpack: {
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join(__dirname, './cloud'),
            to: path.join(
              __dirname,
              'dist',
              process.env.NODE_ENV === 'production' ? 'build' : 'dev',
              process.env.UNI_PLATFORM,
              'cloud'
            ),
          },
        ],
      }),
    ],
  },
}
