module.exports = {
    chainWebpack: config => {
        const app = config.entry("app");
        app.clear();
        app.add("./src/testimpl/main.ts");
    }
}