var runtime = require('create-sw/runtime');
runtime.install('./service-worker.js', {
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