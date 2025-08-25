const path = require('path');

module.exports = {
    webpack: {
        configure: (webpackConfig, { env, paths }) => {
            // Production optimizations
            if (env === 'production') {
                // Enhanced code splitting
                webpackConfig.optimization.splitChunks = {
                    chunks: 'all',
                    cacheGroups: {
                        vendor: {
                            test: /[\\/]node_modules[\\/]/,
                            name: 'vendors',
                            chunks: 'all',
                            priority: 10,
                            reuseExistingChunk: true,
                        },
                        mui: {
                            test: /[\\/]node_modules[\\/]@mui[\\/]/,
                            name: 'mui',
                            chunks: 'all',
                            priority: 20,
                            reuseExistingChunk: true,
                        },
                        recharts: {
                            test: /[\\/]node_modules[\\/]recharts[\\/]/,
                            name: 'recharts',
                            chunks: 'all',
                            priority: 20,
                            reuseExistingChunk: true,
                        },
                        react: {
                            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                            name: 'react',
                            chunks: 'all',
                            priority: 30,
                            reuseExistingChunk: true,
                        },
                        common: {
                            name: 'common',
                            minChunks: 2,
                            chunks: 'all',
                            priority: 5,
                            reuseExistingChunk: true,
                        },
                    },
                };

                // Enable tree shaking
                webpackConfig.optimization.usedExports = true;
                webpackConfig.optimization.sideEffects = false;

                // Runtime chunk
                webpackConfig.optimization.runtimeChunk = {
                    name: 'runtime',
                };
            }

            // Resolve optimizations
            webpackConfig.resolve.alias = {
                ...webpackConfig.resolve.alias,
                // Lodash ES for tree shaking
                'lodash': 'lodash-es',
            };

            // Performance hints
            webpackConfig.performance = {
                maxAssetSize: 500000,
                maxEntrypointSize: 500000,
                hints: env === 'production' ? 'warning' : false,
            };

            return webpackConfig;
        },
    },
    plugins: [
        // Bundle analyzer for production builds
        ...(process.env.ANALYZE_BUNDLE === 'true' ? [
            {
                plugin: require('webpack-bundle-analyzer').BundleAnalyzerPlugin,
                options: {
                    analyzerMode: 'static',
                    openAnalyzer: false,
                    reportFilename: 'bundle-report.html',
                },
            },
        ] : []),
    ],
    babel: {
        plugins: [
            // Remove console.log in production
            ...(process.env.NODE_ENV === 'production' ? [
                ['transform-remove-console', { exclude: ['error', 'warn'] }]
            ] : []),

            // Import optimization for MUI v5.15+
            ['import', {
                libraryName: '@mui/material',
                libraryDirectory: '',
                camel2DashComponentName: false,
            }, 'mui-material'],

            ['import', {
                libraryName: '@mui/icons-material',
                libraryDirectory: '',
                camel2DashComponentName: false,
            }, 'mui-icons'],

            // Date-fns optimization - disable to prevent double esm paths
            // ['import', {
            //     libraryName: 'date-fns',
            //     libraryDirectory: 'esm',
            //     camel2DashComponentName: false,
            // }, 'date-fns'],
        ],
    },
};