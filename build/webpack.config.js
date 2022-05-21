const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports.getOutputs = (distPath, libraryName) => {
    return [
        // CommonJS (also ESM compatible)
        {
            path: distPath,
            library: {
                type: "commonjs-static",
            },
            filename: "[name].cjs",
            globalObject: `(typeof self !== 'undefined' ? self : this)`
        },
        // UMD
        {
            path: distPath,
            library: {
                name: libraryName,
                type: "umd",
                umdNamedDefine: true,
            },
            filename: "[name].js",
            globalObject: `(typeof self !== 'undefined' ? self : this)`
        },
    ];
};

module.exports.base = {
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
    },
    externals: {
        vue: {
            commonjs: "vue",
            commonjs2: "vue",
            amd: "vue",
            root: "Vue"
        }
    },
    plugins: [
        new BundleAnalyzerPlugin({
            analyzerMode: "static",
            openAnalyzer: false
        })
    ]
};
