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
        watchOptions: {
            ignored: /node_modules/,
        },
    },

    configureWebpack: {
        resolve: {
            symlinks: false,
        },
    },
};
