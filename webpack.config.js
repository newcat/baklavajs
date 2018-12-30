const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/library.ts',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.vue$/,
                use: 'vue-loader'
            },
            {
                test: /\.scss$/,
                use: [ 'style-loader', 'css-loader', 'sass-loader' ]
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.ts', '.vue'],
        alias: {
            '@': 'F:\\Daten\\Eigene Dokumente\\Programmieren\\baklavajs\\src',
            vue$: 'vue/dist/vue.runtime.esm.js'
        },
    },
    plugins: [
        new VueLoaderPlugin(),
        new CleanWebpackPlugin([ 'dist' ]),
        new CopyWebpackPlugin([
            { from: "src/styles", to: "styles" },
            { from: "src/model", to: "model" },
            { from: "src/options", to: "options" }
        ])
    ],
    output: {
        filename: 'baklava.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'BaklavaJS',
        libraryTarget: 'umd',
        libraryExport: 'default'
    }
};