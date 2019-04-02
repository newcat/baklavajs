const path = require('path');
const merge = require('webpack-merge');
const base = require('../../build/webpack.config');

module.exports = merge(base, {
    entry: {
        index: path.resolve(__dirname, 'src', 'index.ts')
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        library: 'BaklavaJS'
    }
});
