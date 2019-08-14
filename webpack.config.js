const path = require('path')
const webpack = require('webpack'); //to access built-in plugins
module.exports = {
    entry: ['./src/main.js'],
    plugins: [
        new webpack.ProvidePlugin({
            d3: 'd3',
            c3: 'c3',
            chartcollection: 'chartcollection'
        })
     ],
    module: {
        rules: [{

            test: require.resolve('jquery'),
            use: [{
                loader: 'expose-loader',
                options: 'jQuery'
            }, {
                loader: 'expose-loader',
                options: '$'
            }

            ]
        },
        {
            test: require.resolve('d3'),
            use:
            {
                loader: 'expose-loader',
                options: 'd3'
            }
        },
        {
            test: require.resolve('chartcollection'),
            use:
            {
                loader: 'expose-loader',
                options: 'chartcollection'
            }
        }
        ,
        {
            test: require.resolve('c3'),
            use: [{
                loader: 'expose-loader',
                options: 'c3'
            }]
        },
        
        {
            test: require.resolve('plotly'),
            use: [{
                loader: 'expose-loader',
                options: 'Plotly'
            }]
        },
        {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        },
        { test: /\.(png|gif|jpg|cur)$/i, loader: 'url-loader', options: { limit: 8192 } },
        { test: /\.(ttf|eot|svg|otf|woff2|woff)(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'file-loader?name=/fonts/[name].[ext]' }
        ]
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve('./public/webpack'),
        publicPath: '/public/webpack'
    },

}