const CleanWebpackPlugin = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

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
        /*"@baklavajs/core": {
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
        "@baklavajs/plugin-interface-types": {
            commonjs: '@baklavajs/plugin-interface-types',
            commonjs2: '@baklavajs/plugin-interface-types',
            amd: '@baklavajs/plugin-interface-types',
            root: 'BaklavaJSInterfaceTypes'
        },*/
        vue: {
            commonjs: 'vue',
            commonjs2: 'vue',
            amd: 'vue',
            root: 'Vue'
        }
    },
    output: {
        filename: '[name].js',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        globalObject: `(typeof self !== 'undefined' ? self : this)`
    },
    plugins: [
        new CleanWebpackPlugin(),
        new BundleAnalyzerPlugin({
            analyzerMode: "static",
            openAnalyzer: false
        })
    ]
};