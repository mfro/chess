const path = require('path');

module.exports = {
  publicPath: '',

  outputDir: 'dist',

  pages: {
    index: {
      title: 'chess',
      entry: 'src/main.ts',
      filename: 'index.html',
      template: 'src/main.html',
    },
  },

  devServer: {
    disableHostCheck: true,
  },

  configureWebpack: {
    resolve: {
      symlinks: false,
      alias: {
        vue$: path.resolve('../vue-next/packages/vue/dist/vue.runtime.esm-bundler.js'),
      }
    },
  },
};
