import { AdminServer } from '../../lib/app';
import { context, run } from 'f-promise';
import { Fixtures as GlobalFixtures } from 'spirit.io/test/fixtures';
import { ConnectorHelper } from 'spirit.io/lib/core';
import { MongodbConnector } from 'spirit.io-mongodb-connector';
import { RedisConnector } from 'spirit.io-redis-connector';
import * as path from 'path';
import * as importTool from '../../lib/tools/import';

const port = 3001;
const mongodbPort = process.env.SPIRIT_MONGODB_PORT || 27017;
const redisPort = process.env.SPIRIT_REDIS_PORT || 6379;
const redisDbAdmin = 15;
const redisDbSessions = 14;

const config = {
    expressPort: port,
    connectors: {
        mongodb: {
            datasources: {
                "mongodb": {
                    uri: 'mongodb://localhost:' + mongodbPort + '/spirit_admin_test',
                    options: {}
                }
            },
            mongoose: {
                debug: false
            }
        },
        redis: {
            datasources: {
                "redis:admin": {
                    uri: 'redis://localhost:' + redisPort + '/' + redisDbAdmin,
                    options: {}
                },
                "redis:sessions": {
                    uri: 'redis://localhost:' + redisPort + '/' + redisDbSessions,
                    options: {}
                }
            },
            client: {
                debug: false
            }
        }
    },
    sessions: {
        secret: 'SECRET',
        cookieName: 's.io.admin.sid',
        connector: 'redis-sessions',
        redis: {
            ttl: 12000
        }
    }

};

export class Fixtures extends GlobalFixtures {

    static setup = (done) => {
        function reset() {
            // delete the whole database
            let mConnector: MongodbConnector = <MongodbConnector>ConnectorHelper.getConnector('mongodb');
            let rConnector: RedisConnector = <RedisConnector>ConnectorHelper.getConnector('redis');
            Fixtures.cleanDatabases([mConnector, rConnector]);
            // import data necessary for unit test
            importTool.imports(path.join(__dirname, '../../imports/admin-init.json'));

        }

        let firstSetup = true;
        if (!context().__server) {
            let server: AdminServer = context().__server = new AdminServer(config);
            run(() => {
                server.init();
            }).catch(err => {
                done(err);
            });
            server.on('initialized', function () {
                run(() => {
                    console.log("========== Server initialized ============\n");
                    server.start(port);
                }).catch(err => {
                    done(err);
                });
            });
            server.on('started', function () {
                run(() => {
                    console.log("========== Server started ============\n");
                    reset();
                    done();
                }).catch(err => {
                    done(err);
                });
            });
        } else {
            run(() => {
                firstSetup = false;
                reset();
                done();
            }).catch(err => {
                done(err);
            });
        }
        //
        return context().__server;
    }
}





