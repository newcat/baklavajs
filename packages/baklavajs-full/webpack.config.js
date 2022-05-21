const path = require("path");
const { merge } = require("webpack-merge");
const { base, getOutputs } = require("../../build/webpack.vue.config");

module.exports = getOutputs(path.resolve(__dirname, "dist"), "BaklavaJS").map((o) =>
    merge(base, {
        entry: {
            index: path.resolve(__dirname, "src", "index.ts")
        },
        output: o
    })
);
