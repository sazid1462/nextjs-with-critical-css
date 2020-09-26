const webpack = require('webpack');
const withOffline = require('next-offline');
const dotenv = require('dotenv');
const withPurgeCss = require('next-purgecss');
dotenv.config();

const webpackConfig = (config) => {
  // Fixes npm packages that depend on `fs` module
  config.node = {
    fs: 'empty'
  };
  config.plugins.push(
    // Moment.js is an extremely popular library that bundles large locale files
    // by default due to how Webpack interprets its code. This is a practical
    // solution that requires the user to opt into importing specific locales.
    // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
    // You can remove this if you don't use Moment.js:
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en/)
  );
  return config;
};

module.exports = withOffline(withPurgeCss({
  purgeCssPaths: [
    'pages/**/*',
    'components/**/*',
  ],
  purgeCss: {
    whitelist: () => ['player'],
    whitelistPatterns: () => [/Toastify/, /.*nprogress.*/],
    // whitelistPatternsChildren,
    rejected: true
  },
  purgeCssEnabled: ({ dev, isServer }) => true, // Enable PurgeCSS for all env
  // purgeCssEnabled: ({ dev, isServer }) => !dev && !isServer, // Only enable PurgeCSS for client-side production builds
  webpack: webpackConfig,
  env: {
    // List the env variables you want to be avalable in process.env while executing in browser. Never put secret keys or passwords here.
    API_BASE_URL: process.env.API_BASE_URL,
    CDN_URL: process.env.CDN_URL,
    APP_ENV: process.env.APP_ENV,
    CRITICAL_CSS_BASE_URL: process.env.CRITICAL_CSS_BASE_URL
  },
  pageExtensions: ['js'],
  workboxOpts: {
    runtimeCaching: [
      {
        urlPattern: /^https?\.example\.com*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'offlineCache',
          expiration: {
            maxEntries: 200
          }
        }
      }, {
        urlPattern: /^https?\.example\.com\/api*/,
        handler: 'NetworkOnly'
      }, {
        urlPattern: /^https?\.example\.com\/static*/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'offlineCache',
          expiration: {
            maxEntries: 200
          }
        }
      },
    ]
  }
}));
