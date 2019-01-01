const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    mode: "production",
    entry: {
        lib: './src/lib.ts',
        styles: './src/styles/all.scss'
    },
    externals: {
        commonjs: 'vue',
        commonjs2: 'vue',
        root: 'Vue'
    },
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
                test: /\.scss$/,
                use: [ MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader' ]
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.ts', '.vue'],
        /*alias: {
            vue$: 'vue/dist/vue.runtime.esm.js'
        }*/
    },
    plugins: [
        new VueLoaderPlugin(),
        new CleanWebpackPlugin([ 'dist' ]),
        new CopyWebpackPlugin([
            { from: "src/styles", to: "styles" },
            { from: "src/options", to: "options" }
        ]),
        new MiniCssExtractPlugin({
            filename: "[name].css",
        })
    ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: 'BaklavaJS',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        globalObject: `(typeof self !== 'undefined' ? self : this)`
    }
};