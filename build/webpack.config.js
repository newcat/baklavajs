const { merge } = require("webpack-merge");

const baseConfig = {
    mode: "production",
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader",
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".js"]
    }
};

module.exports.getConfig = (distPath, libraryName, additionalConfig = {}) => {
    return [
        // CommonJS (also ESM compatible)
        {
            ...baseConfig,
            output: {
                path: distPath,
                library: {
                    type: "commonjs-static"
                },
                filename: "[name].cjs",
                globalObject: `(typeof self !== 'undefined' ? self : this)`
            },
            externals: {
                vue: "vue"
            }
        },
        // UMD
        {
            ...baseConfig,
            output: {
                path: distPath,
                library: {
                    name: libraryName,
                    type: "umd",
                    umdNamedDefine: true
                },
                filename: "[name].js",
                globalObject: `(typeof self !== 'undefined' ? self : this)`
            },
            externals: {
                vue: {
                    commonjs: "vue",
                    commonjs2: "vue",
                    amd: "vue",
                    root: "Vue"
                }
            }
        }
    ].map((c) => merge(c, additionalConfig));
};
