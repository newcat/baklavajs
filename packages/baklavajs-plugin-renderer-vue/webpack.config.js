const path = require("path");
const merge = require("webpack-merge");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const base = require("../../build/webpack.vue.config");

module.exports = merge(base, {
    entry: {
        index: "./src/index.ts",
        styles: "./src/styles/all.scss"
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [{ from: "src/styles", to: "styles" }]
        })
    ],
    output: {
        path: path.resolve(__dirname, "dist"),
        library: "BaklavaJSRendererVue"
    }
});
