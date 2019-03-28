const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    mode: "production",
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts']
    },
    externals: {
        "@baklavajs/core": {
            commonjs: '@baklavajs/core',
            commonjs2: '@baklavajs/core',
            amd: '@baklavajs/core',
            root: 'BaklavaJS'
        },
        "@baklavajs/plugin-renderer-vue": {
            commonjs: '@baklavajs/plugin-renderer-vue',
            commonjs2: '@baklavajs/plugin-renderer-vue',
            amd: '@baklavajs/plugin-renderer-vue',
            root: 'BaklavaJSRendererVue'
        },
        vue: {
            commonjs: 'vue',
            commonjs2: 'vue',
            amd: 'vue',
            root: 'Vue'
        }
    },
    plugins: [
        new CleanWebpackPlugin()
    ]
};