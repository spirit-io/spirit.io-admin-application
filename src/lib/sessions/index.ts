import { Application, Request, Response, NextFunction } from "express";
import { Registry } from 'spirit.io/lib/core';
import { ModelFactory as RedisFactory } from 'spirit.io-redis-connector/lib/modelFactory';
import * as helper from '../auth/helper';
import { run } from 'f-promise';
import * as session from 'express-session';
import * as connectRedis from 'connect-redis';
import * as debug from 'debug';
const RedisStore = connectRedis(session);
const trace = debug('sio-admin:sessions');

let sessionStore: any;

export function ensureAuthenticated(req: Request, res: Response, next?: NextFunction) {

    // provide the data that was used to authenticate the request; if this is 
    // not set then no attempt to authenticate is registered. 
    //    req['challenge'] = req.get('Authorization');
    trace("============================================================");
    trace("Session: ", (req.session && req.session.id) + ': ' + JSON.stringify(req.session, null, 2));

    if (req.session['user']) {
        req['authenticated'] = req.session['user'];
        trace(`User '${req.session['user']}' reused session ${req.session.id}`);

    }

    // If the authorization header is correct, mark the request as being authenticated
    else if (req.headers['authorization']) {
        let authMethod = req.headers['authorization'].split(' ')[0].toLowerCase();
        trace(`New session created with authentication ${authMethod}`);
        let authModule = getAuthModule(authMethod);
        req['authenticated'] = authModule.authenticate(req, res);
        if (req['authenticated']) {
            trace(`Authentication succeeded for user ${req['authenticated']}`);
            req.session['user'] = req['authenticated'];
        }
    }
    next && next();
}

export function initSessionStore(app: Application, config: any) {
    // Session middleware is registered first
    if (config.sessions) {
        let redisFactory = (<RedisFactory>Registry.getFactory('Session'));
        if (!redisFactory) throw new Error("No redis factory registered for sessions");
        let options = config.sessions.redis = config.sessions.redis || {};
        options.logErrors = config.sessions.redis.logErrors != null ? config.sessions.redis.logErrors : true;
        options.prefix = "Session:";
        options.client = redisFactory.client;
        options.serializer = {
            stringify: function (session: any) {
                if (!session._id) session._id = session.id;
                if (!session._createdAt) session._createdAt = new Date();
                session._updatedAt = new Date();
                return JSON.stringify(session);
            },
            parse: function (session) {
                return JSON.parse(session);
            }
        }
        sessionStore = new RedisStore(options);
        let maxAge = config.sessions.redis.ttl * 1000 || 60000;
        let sessionMiddleware = session({
            store: sessionStore,
            secret: config.sessions.secret || 'secret',
            resave: true,
            saveUninitialized: false,
            name: config.sessions.cookieName || 'spirit.io.admin.sid',
            cookie: {
                path: '/',
                httpOnly: true,
                secure: false,
                maxAge: maxAge
            }
        });
        app.use(sessionMiddleware);
        app.use(function (req: Request, res: Response, next: NextFunction) {
            run(() => {
                var tries = 3

                function lookupSession(error?: Error) {
                    if (error) {
                        throw error;
                    }

                    tries -= 1

                    if (req.session !== undefined) {
                        return;
                    }

                    if (tries < 0) {
                        throw new Error('Sessions handler not available');
                    }

                    sessionMiddleware(req, res, lookupSession)
                }

                lookupSession();
                next();
            }).catch(e => {
                next(e);
            });
        })
    } else {
        throw new Error("Redis session store is not configured. Please check your configuration file.");
    }
}

export function getSessionStore() {
    //console.log("sessionStore:", sessionStore)
    return sessionStore;
}

function getAuthModule(name) {
    let mod = require('../auth/' + name);
    if (!mod) throw helper.badAuthMethod(name);
    return mod();
};