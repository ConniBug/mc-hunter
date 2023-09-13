'use strict'

const path = require('path')
const autoprefixer = require('autoprefixer')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const miniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackInlineSVGPlugin = require('html-webpack-inline-svg-plugin')
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest')

module.exports = {
    mode: 'production',
    entry: './src/js/main.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist')
    },
    devServer: {
        static: path.resolve(__dirname, 'dist'),
        port: 8080,
        hot: false,
        compress: false,
        allowedHosts: 'all',
    },
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "output management",
            template: "./index.html",
            favicon: "./src/favicon.ico",
            filename: "index.html",
            inject: "head",
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true,
            },
        }),

        // new HtmlWebpackPlugin({ template: './src/index.html' }),
        new HtmlWebpackInlineSVGPlugin({
            inlineAll: true,
        }),
        new miniCssExtractPlugin(),
        new WebpackManifestPlugin({
            fileName: 'manifest.json',
            basePath: 'dist/',
        }),
        // new WorkboxPlugin.GenerateSW({
        //     clientsClaim: true,
        //     skipWaiting: true,
        // }),
        new WebpackPwaManifest(
            {
                id: "https://mcs-dev.conni.lgbt/",

                "dir": "ltr",
                "lang": "en",
                "display_override": [
                    "window-controls-overlay"
                ],
                "categories": [
                    "productivity"
                ],

                name: "MCS ",
                short_name: "Minecraft Server Hunter",
                description: "An opensource self-hosted solution to hunting out minecraft servers to explorer <3",
                background_color: '#e5bdff',
                theme_color: '#2d2d2d',
                orientation: "portrait-primary",
                display: "fullscreen",
                start_url: ".",
                inject: true,
                fingerprints: true,
                ios: true,
                publicPath: "/",
                includeDirectory: true,
            }
        ),
    ],
    module: {
        rules: [
            {
                mimetype: 'image/svg+xml',
                scheme: 'data',
                type: 'asset/resource',
                generator: {
                    filename: 'icons/[hash].svg'
                }
            },
            {
                test: /\.(scss)$/,
                use: [
                    { loader: miniCssExtractPlugin.loader },
                    { loader: 'css-loader' },
                    { loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [ autoprefixer ]
                            }
                        }
                    },
                    { loader: 'sass-loader' }
                ]
            },
            {
                test: /\.css$/,
                use: [
                    { loader: miniCssExtractPlugin.loader },
                    { loader: 'css-loader' }
                ]
            }
        ]
    },
    devtool: 'source-map',
}