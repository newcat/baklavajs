const { merge, mergeWithRules } = require("webpack-merge");
const { getConfig } = require("./webpack.config");

const VueLoaderPlugin = require("vue-loader/lib/plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

function mergeVueConfig(config) {
    return mergeWithRules({
        module: {
            rules: {
                loader: "match",
                options: "replace"
            }
        }
    })(config, {
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    loader: "ts-loader",
                    options: {
                        appendTsSuffixTo: [/\.vue$/]
                    },
                    exclude: /node_modules/
                },
                {
                    test: /\.vue$/,
                    use: "vue-loader"
                },
                {
                    test: /\.(sa|sc|c)ss$/,
                    use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]
                }
            ]
        },
        resolve: {
            extensions: [".ts", ".vue"]
        },
        plugins: [
            new VueLoaderPlugin(),
            new MiniCssExtractPlugin({
                filename: "[name].css"
            })
        ],
        optimization: {
            minimize: false,
            concatenateModules: false
        }
    });
}

module.exports.getConfig = (distPath, libraryName, additionalConfig = {}) => {
    return getConfig(distPath, libraryName)
        .map((c) => mergeVueConfig(c))
        .map((c) => merge(c, additionalConfig));
};
