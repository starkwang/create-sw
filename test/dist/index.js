var runtime = require('../../runtime');
runtime.install('./service-worker.js', {
    onUpdated() {
        console.log('onUpdated!!!!!!!!')
    }
})