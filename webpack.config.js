const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = {
    mode: "production",
    entry: {
        index: './src/index.ts',
        styles: './src/styles/all.scss'
    },
    externals: {
        vue: {
            commonjs: 'vue',
            commonjs2: 'vue',
            amd: 'vue',
            root: 'Vue'
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true,
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
        extensions: ['.js', '.ts', '.vue'],
        /*alias: {
            vue$: 'vue/dist/vue.runtime.esm.js'
        }*/
    },
    plugins: [
        new VueLoaderPlugin(),
        new ForkTsCheckerWebpackPlugin({
            vue: true,
            tslint: true,
            formatter: 'codeframe',
            checkSyntacticErrors: false
        }),
        new CleanWebpackPlugin([ 'dist' ]),
        new CopyWebpackPlugin([
            { from: "src/styles", to: "styles" }
        ]),
        new MiniCssExtractPlugin({
            filename: "[name].css",
        }),
        new BundleAnalyzerPlugin({
            analyzerMode: "static",
            openAnalyzer: false
        })
    ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: 'BaklavaJS',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        globalObject: `(typeof self !== 'undefined' ? self : this)`
    },
    optimization: {
        minimize: false
    },
    performance: {
        maxEntrypointSize: 200000
    }
};