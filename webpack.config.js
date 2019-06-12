const path = require('path')
const webpack = require('webpack'); //to access built-in plugins

module.exports = {
    entry: ['./src/main.js'],
    module: {
        rules: [{
            test: require.resolve('jquery'),
            use: [{
                loader: 'expose-loader',
                options: 'jQuery'
            }, {
                loader: 'expose-loader',
                options: '$'
            }]
        }, {
            test: require.resolve('c3'),
            use: [{
                loader: 'expose-loader',
                options: 'c3'
            }]
        },
        {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        },
        {
            test: /\.(png|jpg|gif)$/,
            use: [
              {
                loader: 'file-loader',
                options: {}
              }
            ]
          }]
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public')
    },

}