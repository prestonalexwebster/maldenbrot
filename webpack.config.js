const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            { test: /\.glsl$/, use: 'file-to-string-loader'},
        ]
    },
    devtool: "source-map"
};