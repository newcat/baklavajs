const path = require("path");
const { getConfig } = require("../../build/webpack.config");

module.exports = getConfig(path.resolve(__dirname, "dist"), "BaklavaJS", {
    entry: {
        index: path.resolve(__dirname, "src", "index.ts")
    }
});
