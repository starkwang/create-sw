var runtime = require('../../runtime');
runtime.install({
    publicPath: './service-worker.js',
    onUpdated() {
        console.log('onUpdated!!!!!!!!')
    }
})