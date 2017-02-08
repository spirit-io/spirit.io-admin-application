import * as path from 'path';
const HTTP_PORT = process.env.SPIRIT_HTTP_PORT || 3000;

const MONGO_HOST = process.env.SPIRIT_MONGODB_HOST || 'localhost';
const MONGO_PORT = process.env.SPIRIT_MONGODB_PORT || 27017;
const MONGO_DB = process.env.SPIRIT_MONGODB_DB || "spirit_admin";
const MONGO_URL = 'mongodb://' + MONGO_HOST + ':' + MONGO_PORT + '/' + MONGO_DB;

const REDIS_HOST = process.env.SPIRIT_REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.SPIRIT_REDIS_PORT || 6379;
const REDIS_URL = 'redis://' + REDIS_HOST + ':' + REDIS_PORT;

const SECRET = process.env.SPIRIT_SESSIONS_SECRET || 'spirit.io';

exports.config = {
    system: {
        exposeStack: true
    },
    port: HTTP_PORT,
    https: true,
    certs: path.resolve(path.join(process.cwd(), '../certs')),
    connectors: {
        mongodb: {
            datasources: {
                "mongodb": {
                    uri: MONGO_URL,
                    options: {},
                    autoConnect: true
                }
            },
            mongoose: {
                debug: false
            }
        },
        redis: {
            datasources: {
                "redis:admin": {
                    uri: REDIS_URL + "/1",
                    options: {},
                    autoConnect: true
                },
                "redis:sessions": {
                    uri: REDIS_URL,
                    options: {},
                    autoConnect: true
                }
            },
            client: {
                debug: false
            }
        }
    },
    sessions: {
        secret: SECRET,
        cookieName: 's.io.admin.sid',
        connector: 'redis-sessions',
        redis: {
            ttl: 12000
        }
    },
    debug: {
        sio: {
            factory: true
        },
        'sio-admin': {
            app: true
        }
    }
};