# [![npm version](https://badge.fury.io/js/create-sw.svg)](https://badge.fury.io/js/create-sw)

# create-sw
A tool to generate robust Service Worker for your application.



## Install
```
npm i -S create-sw
```

or you can install it globally:

```
npm i -g create-sw
```

## Usage

### 1、build service-worker.js

This tool provides a cli tool to help you build your own `service-worker.js`

```
create-sw --config=sw-config.js
```

`sw-config.js` has the same options in [sw-precache](https://www.npmjs.com/package/sw-precache) and some unique options:

#### externals [Array<string>]

An array contains the external resources url that you want to precache.

```js
module.exports = {
  // ...
  externals: [
  	'https://cdn.bootcss.com/jquery/3.2.1/jquery.js',
  	'https://cdn.bootcss.com/bootstrap/4.0.0-beta/css/bootstrap.css'
  ]
};
```

### 2、runtime

This tool also provides a runtime for you to install Service Worker and set a callback to the Service Worker lifecycle:

```js
// In your Javascript code
var runtime = require('create-sw/runtime');
runtime.install('/path/to/sw.js', {
    onInstalled() {
        console.log('onInstalled')
    },
    onUpdated() {
        console.log('onUpdated')
    },
    onUpdateFailed() {
        console.log('onUpdateFailed')
    }
})
```

## License

[MIT](https://opensource.org/licenses/MIT)