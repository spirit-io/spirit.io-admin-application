"use strict";
const fpromise = require('f-promise');
let AdminServer = require('./lib/app').AdminServer;
let app = new AdminServer();


app.on('initialized', function () {
    fpromise.run(() => {
        console.log("========== Server initialized ============\n");
        app.start();
    }).catch(err => {
        console.error(err);
    });
});

app.on('started', function () {
    fpromise.run(() => {
        console.log("========== Server started ============\n");
    }).catch(err => {
        console.error(err);
    });
});

fpromise.run(() => {
    app.init();
}).catch(err => {
    console.error("An error occured on initialization: ", err.stack);
});
