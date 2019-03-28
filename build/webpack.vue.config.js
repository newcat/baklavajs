const CleanWebpackPlugin = require('clean-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    mode: "production",
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                options: {
                    appendTsSuffixTo: [/\.vue$/],
                },
                exclude: /node_modules/
            },
            {
                test: /\.vue$/,
                use: 'vue-loader'
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [ MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader' ]
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.vue']
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
        new CleanWebpackPlugin(),
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename: "[name].css",
        })
    ],
    optimization: {
        minimize: false,
        concatenateModules: false
    }
};
