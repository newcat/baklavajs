const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { getConfig } = require("../../build/webpack.vue.config");

module.exports = getConfig(path.resolve(__dirname, "dist"), "BaklavaJSRendererVue", {
    entry: {
        index: "./src/index.ts",
        styles: "./src/styles/all.scss"
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [{ from: "src/styles", to: "styles" }]
        })
    ]
});
