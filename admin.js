"use strict";
const fpromise = require('f-promise');

let AdminServer = require('./lib/app').AdminServer;
let app = new AdminServer().init();
app.on('initialized', () => {
    fpromise.run(() => {
        app.start();
    }).catch(err => {
        console.error(err.stack);
    });
});

