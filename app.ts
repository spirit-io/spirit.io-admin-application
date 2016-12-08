/// <reference path="node_modules/spirit.io/index.d.ts" />
import { _ } from 'streamline-runtime';
import { Server } from 'spirit.io/lib/application';
import { MongodbConnector } from 'spirit.io-mongodb-connector/lib/connector';
import { RedisConnector } from 'spirit.io-redis-connector/lib/connector';

import * as sessions from './lib/sessions';
import * as auth from './lib/auth';

const cookieParser = require('cookie-parser');
const path = require('path');

export class AdminServer extends Server {
    constructor(config: any) {
        super(config);

        this.on('initialized', () => {
            console.log("========== Server initialized ============\n");
        });
        console.log("\n========== Initialize server begins ============");
        let mongoConnector = new MongodbConnector(config.connectors.mongodb);
        this.addConnector(mongoConnector);
        console.log("Mongo connector config: " + JSON.stringify(mongoConnector.config, null, 2));

        let redisConnector = new RedisConnector(config.connectors.redis);
        this.addConnector(redisConnector);
        console.log("Redis sessions connector config: " + JSON.stringify(redisConnector.config, null, 2));

        this.contract.registerModelsByPath(path.resolve(path.join(__dirname, './lib/models')));
    }

    init(_: _) {

        // load models
        super.init(_);

        this.app.set('trust proxy', 1)
        this.app.use(cookieParser());
        // Create session store
        sessions.initSessionStore(this.app, this.config);

        // Setup routes for authentication
        auth.setup(_, this);

        return this;
    }

}