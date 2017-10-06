module.exports = {
  staticFileGlobs: [
    './dist/**'
  ],
  stripPrefixMulti: {
    './dist/': '/'
  },
  swFile: '/dist/service-worker.js',
  externals: [
    'https://cdn.bootcss.com/jquery/3.2.1/jquery.min.js'
  ],
  runtimeCaching: [{
    urlPattern: /api/,
    handler: 'networkFirst'
  }],
  minify: true
}
