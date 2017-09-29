#!/usr/bin/env node
const meow = require('meow')
const path = require('path')
const pkg = require('./package.json')
const swPrecache = require('./')
const updateNotifier = require('update-notifier')

updateNotifier({ pkg }).notify()

function setDefaults(cli, configFileFlags) {
  const compositeFlags = cli.flags

  compositeFlags.root = compositeFlags.root || configFileFlags.root || './'
  if (compositeFlags.root.lastIndexOf('/') !== compositeFlags.root.length - 1) {
    compositeFlags.root += '/'
  }

  compositeFlags.stripPrefix = compositeFlags.stripPrefix ||
    configFileFlags.stripPrefix || compositeFlags.root

  compositeFlags.stripPrefixMulti = compositeFlags.stripPrefixMulti ||
    configFileFlags.stripPrefixMulti || {}

  compositeFlags.swFile = compositeFlags.swFile || configFileFlags.swFile ||
    'service-worker.js'
  compositeFlags.swFilePath = compositeFlags.swFilePath ||
    configFileFlags.swFilePath ||
    path.join(compositeFlags.root, compositeFlags.swFile)

  compositeFlags.cacheId = compositeFlags.cacheId ||
    configFileFlags.cacheId || cli.pkg.name

  compositeFlags.dynamicUrlToDependencies =
    compositeFlags.dynamicUrlToDependencies ||
    configFileFlags.dynamicUrlToDependencies

  compositeFlags.directoryIndex = compositeFlags.directoryIndex ||
    configFileFlags.directoryIndex

  compositeFlags.navigateFallback = compositeFlags.navigateFallback ||
    configFileFlags.navigateFallback

  compositeFlags.navigateFallbackWhitelist =
    compositeFlags.navigateFallbackWhitelist ||
    configFileFlags.navigateFallbackWhitelist

  compositeFlags.staticFileGlobs = compositeFlags.staticFileGlobs ||
    configFileFlags.staticFileGlobs
  if (compositeFlags.staticFileGlobs) {
    if (typeof compositeFlags.staticFileGlobs === 'string') {
      compositeFlags.staticFileGlobs = [compositeFlags.staticFileGlobs]
    }
  } else {
    compositeFlags.staticFileGlobs = [`${compositeFlags.root}/**/*.*`]
  }

  compositeFlags.ignoreUrlParametersMatching =
    compositeFlags.ignoreUrlParametersMatching ||
    configFileFlags.ignoreUrlParametersMatching
  if (compositeFlags.ignoreUrlParametersMatching &&
      typeof compositeFlags.ignoreUrlParametersMatching === 'string') {
    compositeFlags.ignoreUrlParametersMatching =
      compositeFlags.ignoreUrlParametersMatching.split(',').map(s => new RegExp(s))
  }

  compositeFlags.importScripts = compositeFlags.importScripts ||
    configFileFlags.importScripts
  if (compositeFlags.importScripts &&
      typeof compositeFlags.importScripts === 'string') {
    compositeFlags.importScripts = compositeFlags.importScripts.split(',')
  }

  compositeFlags.runtimeCaching = compositeFlags.runtimeCaching ||
    configFileFlags.runtimeCaching

  compositeFlags.templateFilePath = compositeFlags.templateFilePath ||
    configFileFlags.templateFilePath

  compositeFlags.maximumFileSizeToCacheInBytes =
    compositeFlags.maximumFileSizeToCacheInBytes ||
    configFileFlags.maximumFileSizeToCacheInBytes

  // We can't just use ||, since compositeFlags.skipWaiting might be false.
  if ('skipWaiting' in compositeFlags) {
    compositeFlags.skipWaiting = compositeFlags.skipWaiting
  } else if ('skipWaiting' in configFileFlags) {
    compositeFlags.skipWaiting = configFileFlags.skipWaiting
  } else {
    compositeFlags.skipWaiting = undefined
  }

  // We can't just use ||, since compositeFlags.clientsClaim might be false.
  if ('clientsClaim' in compositeFlags) {
    compositeFlags.clientsClaim = compositeFlags.clientsClaim
  } else if ('clientsClaim' in configFileFlags) {
    compositeFlags.clientsClaim = configFileFlags.clientsClaim
  } else {
    compositeFlags.skipWaiting = undefined
  }

  compositeFlags.dontCacheBustUrlsMatching =
    compositeFlags.dontCacheBustUrlsMatching ||
    configFileFlags.dontCacheBustUrlsMatching
  compositeFlags.externals =
    compositeFlags.externals ||
    configFileFlags.externals

  return compositeFlags
}

const cli = meow({
  help: 'Options from https://github.com/GoogleChrome/sw-precache#options ' +
        'are accepted as flags.\nAlternatively, use --config <file>, where ' +
        '<file> is the path to a JavaScript file that defines the same ' +
        'options via module.exports.\n' +
        'When both a config file and command line option is given, the ' +
        'command line option takes precedence.'
})

// If the --config option is used, then read the options from an external
// JSON configuration file. Options from the --config file can be overwritten
// by any command line options.
const configFileFlags = cli.flags.config ? require(path.resolve(cli.flags.config)) : {}
const options = setDefaults(cli, configFileFlags)

swPrecache.write(options.swFilePath, options, (error) => {
  if (error) {
    console.error(error.stack)
    process.exit(1)
  }

  console.log(
    options.swFilePath,
    'has been generated with the service worker contents.'
  )
})
