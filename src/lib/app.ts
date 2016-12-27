import { Server } from 'spirit.io/lib/application';
import { MongodbConnector } from 'spirit.io-mongodb-connector/lib/connector';
import { RedisConnector } from 'spirit.io-redis-connector/lib/connector';
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
        let mongoConnector = new MongodbConnector(config.connectors.mongodb);
        this.addConnector(mongoConnector);
        trace("Mongo connector config: ", JSON.stringify(mongoConnector.config, null, 2));

        let redisConnector = new RedisConnector(config.connectors.redis);
        this.addConnector(redisConnector);
        trace("Redis connector config: ", JSON.stringify(redisConnector.config, null, 2));
        this.contract.registerModelsByPath(path.resolve(path.join(__dirname, './models')));

    }

    start(port?: number) {

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
        super.start(port || this.config.port);
    }

}
