module.exports = {
    chainWebpack: config => {
        const app = config.entry("app");
        app.clear();
        app.add("./testimpl/main.ts");
    }
}