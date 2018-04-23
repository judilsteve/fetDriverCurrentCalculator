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
        rules: [
            { test: /\.(t|j)sx?$/, use: { loader: 'awesome-typescript-loader' } },
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', 'js', 'jsx']
    },
    devtool: 'source-map',
    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    }
}