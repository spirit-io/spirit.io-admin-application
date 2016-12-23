import { run } from 'f-promise';
import { AdminServer } from '../app';
import { Request, Response, NextFunction } from "express";
import * as helper from '../auth/helper';
import * as sessions from '../sessions';

export function setup(server: AdminServer) {
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
