const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

const files = ["index", "new-event", "edit-profile", "event-detail", "login", "profile", "register"];

module.exports = {
    mode: 'development',
    context: path.join(__dirname, './src'),
    devtool: 'source-map',
    devServer: {
        static: path.join(__dirname, '/dist'), // Default (project's root directory)
        compress: true, // Enable gzip compresion when serving content
        port: 8080, // Default
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    entry: files.reduce((obj, current) => Object.assign(obj, { [current]: `./${current}` }), {}),
    output: {
        filename: '[name].bundle.js',
        path: path.join(__dirname + '/dist'),
        publicPath: '/'   // should be ./ for the build to include the correct path.
    },
    plugins: [
        new MiniCssExtractPlugin(),
        ...files.map(f => new HtmlWebpackPlugin({
            filename: `${f}.html`,
            template: `../${f}.html`,
            chunks: [f, 'commons', 'vendors']
        })),
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            },
            { test: /\.handlebars$/, loader: "handlebars-loader" },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'ts-loader',
                }],
            }
        ]
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    chunks: "initial", // Optimize chunks generation
                    name: "commons", // chunk name
                    minChunks: 2, // How many files import this chunk
                    minSize: 0 // Minimum size of the separated chunk
                },
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        }
    }
}