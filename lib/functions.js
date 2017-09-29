const URL = require('dom-urls')

function stripIgnoredUrlParameters(originalUrl, ignoreUrlParametersMatching) {
  const url = new URL(originalUrl)
  // Remove the hash; see https://github.com/GoogleChrome/sw-precache/issues/290
  url.hash = ''

  url.search = url.search.slice(1) // Exclude initial '?'
    .split('&') // Split into an array of 'key=value' strings
    .map(kv => kv.split('='))
    .filter(function (kv) {
      return ignoreUrlParametersMatching.every(function (ignoredRegex) {
        // Return true iff the key doesn't match any of the regexes.
        return !ignoredRegex.test(kv[0])
      })
    })
    .map(function (kv) {
      return kv.join('=') // Join each [key, value] array into a 'key=value' string
    })
    .join('&') // Join the array of 'key=value' strings into a string with '&' in between each

  return url.toString()
}

function addDirectoryIndex(originalUrl, index) {
  const url = new URL(originalUrl)
  if (url.pathname.slice(-1) === '/') {
    url.pathname += index
  }
  return url.toString()
}

function isPathWhitelisted(whitelist, absoluteUrlString) {
  // If the whitelist is empty, then consider all URLs to be whitelisted.
  if (whitelist.length === 0) {
    return true
  }

  // Otherwise compare each path regex to the path of the URL passed in.
  const path = (new URL(absoluteUrlString)).pathname
  return whitelist.some(function (whitelistedPathRegex) {
    return path.match(whitelistedPathRegex)
  })
}

function createCacheKey(originalUrl, paramName, paramValue, dontCacheBustUrlsMatching) {
  // Create a new URL object to avoid modifying originalUrl.
  const url = new URL(originalUrl)

  // If dontCacheBustUrlsMatching is not set, or if we don't have a match,
  // then add in the extra cache-busting URL parameter.
  if (!dontCacheBustUrlsMatching ||
    !(url.pathname.match(dontCacheBustUrlsMatching))) {
    url.search += `${(url.search ? '&' : '') + encodeURIComponent(paramName)}=${encodeURIComponent(paramValue)}`
  }

  return url.toString()
}

// When passed a redirected response, this will create a new, "clean" response
// that can be used to respond to a navigation request.
// See https://bugs.chromium.org/p/chromium/issues/detail?id=669363&desc=2#c1
function cleanResponse(originalResponse) {
  // If this is not a redirected response, then we don't have to do anything.
  if (!originalResponse.redirected) {
    return Promise.resolve(originalResponse)
  }

  // Firefox 50 and below doesn't support the Response.body stream, so we may
  // need to read the entire body to memory as a Blob.
  const bodyPromise = 'body' in originalResponse ?
    Promise.resolve(originalResponse.body) :
    originalResponse.blob()

  return bodyPromise.then(function (body) {
    // new Response() is happy when passed either a stream or a Blob.
    return new Response(body, {
      headers: originalResponse.headers,
      status: originalResponse.status,
      statusText: originalResponse.statusText
    })
  })
}

module.exports = {
  stripIgnoredUrlParameters,
  addDirectoryIndex,
  isPathWhitelisted,
  createCacheKey,
  cleanResponse
}
