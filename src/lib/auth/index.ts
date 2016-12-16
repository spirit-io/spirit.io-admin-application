import { run, wait } from 'f-promise';
import { AdminServer } from '../app';
import { Application, Request, Response, NextFunction } from "express";
import { User } from '../models/user';
import { IModelHelper } from 'spirit.io/lib/interfaces';
import { AdminHelper } from 'spirit.io/lib/core';
import * as helper from '../auth/helper';
import * as sessions from '../sessions';
import * as fs from "mz/fs";
import * as path from 'path';

function initUsers() {
    let userHelper: IModelHelper = AdminHelper.model(User);
    let users: User[] = userHelper.fetchInstances();
    if (!users || !users.length) {
        let _f: any = wait(fs.readFile(path.join(__dirname, '../../imports/admin-init.json'), 'utf8'));
        let _import = JSON.parse(_f);
        _import.User.forEach(u => {
            new User(u).save();
            console.log("User created with data:\n", JSON.stringify(u, null, 2));
        });
    }
}

export function setup(server: AdminServer) {
    // Create admin user if no one exists
    initUsers();
    // Set auth middleware for authentication
    server.middleware.authMiddleware = sessions.ensureAuthenticated;

    server.app.get('/', (req: Request, res: Response) => {
        res.send("Spirit.io-admin Application");
    });

    // Register login route
    server.app.use('/login', (req: Request, res: Response, next: NextFunction) => {
        run(() => {
            sessions.ensureAuthenticated(req, res);
            let usr = req['authenticated'];
            if (usr) {
                res.json({
                    $diagnoses: [{
                        $severity: 'info',
                        $message: `User '${usr}' logged in successfully`
                    }]
                });
            } else {
                res.setHeader("WWW-Authenticate", "Basic");
                throw helper.unauthorized();
            }
            next();
        }).catch(e => {
            next(e);
        });
    });

    // Register logout route
    server.app.get('/logout', (req: Request, res: Response, next: NextFunction) => {
        run(() => {
            let usr = req.session['user'];
            if (!usr) {
                res.json({
                    $diagnoses: [{
                        $severity: 'error',
                        $message: `Logout failed. No session found.`
                    }]
                });
            } else {
                req.session.destroy(e => {
                    if (e) throw e;
                    res.json({
                        $diagnoses: [{
                            $severity: 'info',
                            $message: `User '${usr}' logged out successfully`
                        }]
                    });
                });
            }
        }).catch(e => {
            next(e);
        });
    });

}
