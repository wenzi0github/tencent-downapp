const path = require('path')

function resolve (dir) {
    return path.join(__dirname, '..', dir)
}

module.exports = {
    // mode: 'development',
    // entry: [
    //     "babel-polyfill",
    //     "./index.js"
    // ],
    entry: {
        test: __dirname+'/test/es6-test.js'
    },
    output: {
        path: __dirname + '/dist/'
    },
    module: {
        rules: [
            {
                test: /\.js?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
            }
        ]
    }
};