import { Server } from 'spirit.io/lib/application';
import { MongodbConnector } from 'spirit.io-mongodb-connector/lib/connector';
import { RedisConnector } from 'spirit.io-redis-connector/lib/connector';
import { run } from 'f-promise';
import * as sessions from './sessions';
import * as auth from './auth';

const cookieParser = require('cookie-parser');
const path = require('path');

export class AdminServer extends Server {
    constructor(config?: any) {
        if (!config) config = require('./config').config;
        super(config);
    }

    init() {
        run(() => {
            console.log("\n========== Initialize server begins ============");
            let mongoConnector = new MongodbConnector(this.config.connectors.mongodb);
            this.addConnector(mongoConnector);
            console.log("Mongo connector config: " + JSON.stringify(mongoConnector.config, null, 2));

            let redisConnector = new RedisConnector(this.config.connectors.redis);
            this.addConnector(redisConnector);
            console.log("Redis sessions connector config: " + JSON.stringify(redisConnector.config, null, 2));

            this.contract.registerModelsByPath(path.resolve(path.join(__dirname, './models')));


            // load models
            super.init();
            this.on('initialized', () => {
                this.app.set('trust proxy', 1)
                this.app.use(cookieParser());
                // Create session store
                sessions.initSessionStore(this.app, this.config);

                // Setup routes for authentication
                auth.setup(this);
                console.log("========== Server initialized ============\n");
                this.start(this.config.expressPort);
            });

        }).catch(err => {
            console.error(err.stack);
        })

        return this;
    }
}