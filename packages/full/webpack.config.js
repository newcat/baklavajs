const path = require("path");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    mode: "production",
    entry: {
        bundle: "./src/bundle.ts",
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        library: "BaklavaJS",
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
        ],
    },
    resolve: {
        extensions: [".js", ".ts"],
    },
    output: {
        filename: "[name].js",
        libraryTarget: "umd",
        umdNamedDefine: true,
        globalObject: `(typeof self !== 'undefined' ? self : this)`,
    },
    plugins: [
        new BundleAnalyzerPlugin({
            analyzerMode: "static",
            openAnalyzer: false,
        }),
        new MiniCssExtractPlugin({
            filename: "[name].css",
        }),
    ],
};
