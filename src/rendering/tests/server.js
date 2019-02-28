const SocketCluster = require('socketcluster');
const scServer = new SocketCluster({
    workers: 1,
    brokers: 1,
    port: 2000,
    workerController: __dirname + '/test_app.js',
    appName: 'comp4770',
    wsEngine: 'sc-uws',
    rebootWorkerOnCrash: false
});