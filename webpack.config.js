const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: path.resolve(__dirname, './src/fetDriverCurrentCalculator.tsx'),
    target: 'web',
    output: {
        path: path.resolve(__dirname, './dist/'),
        filename: 'fetDriverCurrentCalculator.js',
        libraryTarget: 'umd'
    },
    module: {
        loaders: [
            {
              test: /\.tsx?$/,
              exclude: /node_modules/,
              loaders: ['awesome-typescript-loader']
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', 'js', 'jsx']
    },
    devtool: 'source-map'
}