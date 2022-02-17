const fs = require('fs')
const webpack = require('webpack')
const packageJson = fs.readFileSync('./package.json')
const version = JSON.parse(packageJson).version || 0
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")
module.exports = {
    transpileDependencies: ['@vue/reactivity'],
    productionSourceMap: false,
    configureWebpack: {
        plugins: [
            new webpack.DefinePlugin({
                'process.env.PACKAGE_VERSION': '"' + version + '"'
            }),
            new NodePolyfillPlugin()
        ]
    }
}