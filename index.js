"use strict";

require("streamline").register({
    "sourceMaps": "inline"
});
require('streamline-runtime');
const config = require('./config').config;
let App = require('./app').AdminServer;
new App(config).init(function(err, srv) {
    if (err) throw err;
    srv.start(function(err) {
        if (err) throw err;
    }, config.expressPort);
});