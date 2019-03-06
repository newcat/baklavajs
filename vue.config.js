const path = require("path");

module.exports = {
    chainWebpack: config => {
        const app = config.entry("app");
        app.clear();
        app.add("./testimpl/main.ts");
        config.resolve.alias.set("testimpl", path.resolve(__dirname, "testimpl"));
    }
}