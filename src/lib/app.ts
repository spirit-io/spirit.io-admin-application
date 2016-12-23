import { Server } from 'spirit.io/lib/application';
import { MongodbConnector } from 'spirit.io-mongodb-connector/lib/connector';
import { RedisConnector } from 'spirit.io-redis-connector/lib/connector';
<<<<<<< HEAD
=======
import { run } from 'f-promise';
>>>>>>> 130a693e63c0d9cd54cf95bfbe72de55d3a47be7
import * as sessions from './sessions';
import * as auth from './auth';
import * as importTool from './tools/import';
import * as cookieParser from 'cookie-parser';
import * as path from 'path';

import * as debug from 'debug';
const trace = debug('sio-admin:app');


export class AdminServer extends Server {
    constructor(config?: any) {
        if (!config) config = require('./config').config;
        super(config);
<<<<<<< HEAD
        let mongoConnector = new MongodbConnector(config.connectors.mongodb);
        this.addConnector(mongoConnector);
        trace("Mongo connector config: ", JSON.stringify(mongoConnector.config, null, 2));

        let redisConnector = new RedisConnector(config.connectors.redis);
        this.addConnector(redisConnector);
        trace("Redis connector config: ", JSON.stringify(redisConnector.config, null, 2));
=======
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
>>>>>>> 130a693e63c0d9cd54cf95bfbe72de55d3a47be7


<<<<<<< HEAD
    start() {
        // import required initial data
        if (process.env.SPIRIT_ADMIN_INIT) {
            console.log("Import admin initialization data...")
            importTool.imports(path.join(__dirname, '../imports/admin-init.json'));
        }
        this.app.set('trust proxy', 1)
        this.app.use(cookieParser());
        // Create session store
        sessions.initSessionStore(this.app, this.config);

        // Setup routes for authentication
        auth.setup(this);
        super.start(this.config.expressPort);
=======
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
            });

        }).catch(err => {
            console.error(err.stack);
        })

        return this;
>>>>>>> 130a693e63c0d9cd54cf95bfbe72de55d3a47be7
    }

    start(port?: number) {
        super.start(port || this.config.expressPort);
    }
}