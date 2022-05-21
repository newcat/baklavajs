const path = require("path");
const { merge } = require("webpack-merge");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { base, getOutputs } = require("../../build/webpack.vue.config");

module.exports = getOutputs(path.resolve(__dirname, "dist"), "BaklavaJSRendererVue").map((o) =>
    merge(base, {
        entry: {
            index: "./src/index.ts",
            styles: "./src/styles/all.scss"
        },
        plugins: [
            new CopyWebpackPlugin({
                patterns: [{ from: "src/styles", to: "styles" }]
            })
        ],
        output: o
    })
);
