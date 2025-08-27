/**
 * Webpack Optimization Configuration
 * Custom webpack optimizations for bundle size reduction
 */

const path = require('path');

module.exports = {
  // Optimization configuration for production builds
  optimization: {
    // Enable tree shaking
    usedExports: true,
    sideEffects: false,

    // Code splitting configuration
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Vendor chunk for third-party libraries
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
          reuseExistingChunk: true
        },

        // Material-UI chunk
        mui: {
          test: /[\\/]node_modules[\\/]@mui[\\/]/,
          name: 'mui',
          chunks: 'all',
          priority: 20,
          reuseExistingChunk: true
        },

        // Recharts chunk
        recharts: {
          test: /[\\/]node_modules[\\/]recharts[\\/]/,
          name: 'recharts',
          chunks: 'all',
          priority: 20,
          reuseExistingChunk: true
        },

        // Date libraries chunk
        dates: {
          test: /[\\/]node_modules[\\/](date-fns|moment)[\\/]/,
          name: 'dates',
          chunks: 'all',
          priority: 20,
          reuseExistingChunk: true
        },

        // React chunk
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 30,
          reuseExistingChunk: true
        },

        // Common chunk for shared code
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true
        }
      }
    },

    // Runtime chunk
    runtimeChunk: {
      name: 'runtime'
    },

    // Minimize configuration
    minimize: process.env.NODE_ENV === 'production',
    minimizer: [
      // TerserPlugin for JavaScript minification
      new (require('terser-webpack-plugin'))({
        terserOptions: {
          compress: {
            drop_console: process.env.NODE_ENV === 'production',
            drop_debugger: process.env.NODE_ENV === 'production',
            pure_funcs: ['console.log', 'console.info']
          },
          mangle: {
            safari10: true
          },
          format: {
            comments: false
          }
        },
        extractComments: false
      }),

      // CSS minimization
      new (require('css-minimizer-webpack-plugin'))()
    ]
  },

  // Resolve configuration for better tree shaking
  resolve: {
    // Module resolution
    modules: [path.resolve(__dirname, '../src'), 'node_modules'],

    // File extensions
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],

    // Alias for optimized imports
    alias: {
      // Material-UI optimizations
      '@mui/material': '@mui/material/esm',
      '@mui/icons-material': '@mui/icons-material/esm',

      // Date-fns optimization
      'date-fns': 'date-fns/esm',

      // Recharts optimization
      recharts: 'recharts/esm',

      // Lodash optimization
      lodash: 'lodash-es'
    },

    // Main fields for package.json
    mainFields: ['module', 'browser', 'main']
  },

  // Module configuration
  module: {
    rules: [
      // Tree shaking for CSS modules
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                mode: 'local',
                localIdentName:
                  process.env.NODE_ENV === 'production'
                    ? '[hash:base64:5]'
                    : '[name]__[local]--[hash:base64:5]'
              }
            }
          }
        ],
        include: /\.module\.css$/
      }
    ]
  },

  // Performance optimization
  performance: {
    maxAssetSize: 250000,
    maxEntrypointSize: 250000,
    hints: process.env.NODE_ENV === 'production' ? 'warning' : false
  },

  // Development server optimization
  devServer: {
    compress: true,
    hot: true,
    overlay: {
      warnings: false,
      errors: true
    }
  }
};

// Bundle analysis configuration
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

if (process.env.ANALYZE_BUNDLE === 'true') {
  module.exports.plugins = [
    ...(module.exports.plugins || []),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'bundle-report.html'
    })
  ];
}
